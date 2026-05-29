using System.Diagnostics;
using System.Text.Json;
using ApiModule.Api.Contracts.FormAnalysis;
using ApiModule.Domain;
using ApiModule.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using FormAnalysisRecord = ApiModule.Domain.FormAnalysis;

namespace ApiModule.Application.FormAnalysis;

public sealed class FormAnalysisService(
    IConfiguration configuration,
    ICurrentUser currentUser,
    AppDbContext db)
{
    private const long MaxVideoBytes = 250L * 1024L * 1024L;
    private const int DefaultMaxVideoMegabytes = 250;
    private const int DefaultMaxAnalysesPerUser = 50;
    private const int DefaultRetentionDays = 30;
    private const string AnalyzerVersion = "form-analysis-v1";
    private static readonly HashSet<string> SupportedExerciseTypes =
        new(StringComparer.OrdinalIgnoreCase) { "squat", "bench_press" };
    private static readonly HashSet<string> SupportedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".webm", ".mp4", ".mov", ".m4v" };
    private static readonly HashSet<string> SupportedContentTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "video/webm",
            "video/mp4",
            "video/quicktime",
            "video/x-m4v"
        };
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private readonly IConfiguration _configuration = configuration;
    private readonly ICurrentUser _currentUser = currentUser;
    private readonly AppDbContext _db = db;

    public async Task<FormAnalysisResultDto> AnalyzeAsync(
        FormAnalysisUploadRequest request,
        CancellationToken ct)
    {
        var video = ValidateVideoUpload(request.Video, ResolveMaxVideoBytes());

        var ownerId = _currentUser.UserId;
        var normalizedExercise = TrimToMax(NormalizeExerciseType(request.ExerciseType), 80);
        var context = await ResolveContextAsync(request, ownerId, ct);
        var analysisId = Guid.NewGuid();
        var now = DateTime.UtcNow;
        var extension = NormalizeExtension(
            Path.GetExtension(video.FileName),
            video.ContentType);
        var sourceFileName = $"source{extension}";

        var analysis = new FormAnalysisRecord
        {
            Id = analysisId,
            OwnerUserId = ownerId,
            WorkoutRunId = context.WorkoutRunId,
            WorkoutId = context.WorkoutId,
            ExerciseId = request.ExerciseId,
            ExerciseName = TrimOrNull(request.ExerciseName, 200),
            ExerciseType = normalizedExercise,
            StepIndex = request.StepIndex,
            SetNumber = request.SetNumber,
            Status = "processing",
            Summary = "Analysis is processing.",
            FindingsJson = "[]",
            MetricsJson = "[]",
            SourceFileName = sourceFileName,
            AnalyzerVersion = AnalyzerVersion,
            ModelName = ResolveModelName(),
            CreatedAt = now,
            UpdatedAt = now,
        };

        _db.FormAnalyses.Add(analysis);
        await _db.SaveChangesAsync(ct);

        var analysisDir = GetAnalysisDirectory(ownerId, analysisId);
        Directory.CreateDirectory(analysisDir);
        var sourcePath = Path.Combine(analysisDir, sourceFileName);

        try
        {
            await using (var stream = File.Create(sourcePath))
            {
                await video.CopyToAsync(stream, ct);
            }

            var result = SupportedExerciseTypes.Contains(normalizedExercise)
                ? await AnalyzeWithPythonAsync(analysisId, normalizedExercise, sourcePath, analysisDir, ct)
                : CreateUnsupportedResult(analysisId, normalizedExercise);

            var analyzedFileName = File.Exists(Path.Combine(analysisDir, "analyzed.mp4"))
                ? "analyzed.mp4"
                : null;
            var rawResultJson = await ReadRawResultJsonAsync(analysisDir, ct);

            ApplyResult(analysis, result, analyzedFileName, rawResultJson);
            await _db.SaveChangesAsync(ct);
            await RunRetentionCleanupAsync(ownerId);

            return ToDto(analysis);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception)
        {
            ApplyResult(
                analysis,
                CreateScriptFailedResult(analysisId, normalizedExercise),
                analyzedFileName: null,
                rawResultJson: null);
            await _db.SaveChangesAsync(CancellationToken.None);
            await RunRetentionCleanupAsync(ownerId);

            return ToDto(analysis);
        }
    }

    public async Task<List<FormAnalysisResultDto>> ListAsync(
        Guid? workoutRunId,
        Guid? workoutId,
        CancellationToken ct)
    {
        var ownerId = _currentUser.UserId;
        var query = _db.FormAnalyses
            .AsNoTracking()
            .Where(analysis => analysis.OwnerUserId == ownerId);

        if (workoutRunId.HasValue)
        {
            query = query.Where(analysis => analysis.WorkoutRunId == workoutRunId.Value);
        }

        if (workoutId.HasValue)
        {
            query = query.Where(analysis => analysis.WorkoutId == workoutId.Value);
        }

        var analyses = await query
            .OrderByDescending(analysis => analysis.CreatedAt)
            .Take(20)
            .ToListAsync(ct);

        return analyses.Select(ToDto).ToList();
    }

    public async Task<FormAnalysisResultDto?> GetAsync(Guid analysisId, CancellationToken ct)
    {
        var ownerId = _currentUser.UserId;
        var analysis = await _db.FormAnalyses
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.Id == analysisId && item.OwnerUserId == ownerId,
                ct);

        return analysis is null ? null : ToDto(analysis);
    }

    public async Task<FormAnalysisVideoFile?> GetVideoAsync(
        Guid analysisId,
        string? kind,
        CancellationToken ct)
    {
        var ownerId = _currentUser.UserId;
        var analysis = await _db.FormAnalyses
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.Id == analysisId && item.OwnerUserId == ownerId,
                ct);
        if (analysis is null) return null;

        var useAnalyzed = string.Equals(kind, "analyzed", StringComparison.OrdinalIgnoreCase);
        var fileName = useAnalyzed && analysis.AnalyzedFileName is not null
            ? analysis.AnalyzedFileName
            : analysis.SourceFileName;
        var path = Path.Combine(GetAnalysisDirectory(ownerId, analysisId), fileName);

        if (!File.Exists(path)) return null;

        return new FormAnalysisVideoFile
        {
            Path = path,
            ContentType = GetContentType(path),
        };
    }

    private async Task<(Guid? WorkoutRunId, Guid? WorkoutId)> ResolveContextAsync(
        FormAnalysisUploadRequest request,
        Guid ownerId,
        CancellationToken ct)
    {
        if (request.WorkoutRunId.HasValue)
        {
            var run = await _db.WorkoutRuns
                .AsNoTracking()
                .Where(item => item.Id == request.WorkoutRunId.Value && item.OwnerUserId == ownerId)
                .Select(item => new { item.Id, item.WorkoutId })
                .FirstOrDefaultAsync(ct);

            if (run is null)
            {
                throw new InvalidOperationException("Workout run not found.");
            }

            return (run.Id, run.WorkoutId);
        }

        if (request.WorkoutId.HasValue)
        {
            var exists = await _db.Workouts.AnyAsync(
                item => item.Id == request.WorkoutId.Value && item.OwnerUserId == ownerId,
                ct);

            if (!exists)
            {
                throw new InvalidOperationException("Workout not found.");
            }

            return (null, request.WorkoutId.Value);
        }

        return (null, null);
    }

    private async Task<FormAnalysisResultDto> AnalyzeWithPythonAsync(
        Guid analysisId,
        string exerciseType,
        string sourcePath,
        string analysisDir,
        CancellationToken ct)
    {
        var scriptPath = ResolveScriptPath();
        if (scriptPath is null)
        {
            return new FormAnalysisResultDto
            {
                AnalysisId = analysisId,
                ExerciseType = exerciseType,
                Status = "script_not_configured",
                Summary = "Form analysis is temporarily unavailable because the beta analyzer is not configured.",
                Findings =
                [
                    "The uploaded video was saved.",
                    "Try again after the analyzer service is configured.",
                    "Supported analyzers now: squat and bench press."
                ],
                Metrics =
                [
                    new() { Label = "Exercise", Value = ExerciseLabel(exerciseType) },
                    new() { Label = "Engine", Value = "Not configured" }
                ],
            };
        }

        var pythonExecutable = _configuration["FormAnalysis:PythonExecutable"];
        if (string.IsNullOrWhiteSpace(pythonExecutable))
        {
            pythonExecutable = "python";
        }

        var timeoutSeconds = ResolveTimeoutSeconds();
        var resultJsonPath = Path.Combine(analysisDir, "analysis_result.json");
        var analyzedPath = Path.Combine(analysisDir, "analyzed.mp4");
        using var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = pythonExecutable,
                WorkingDirectory = Path.GetDirectoryName(scriptPath) ?? analysisDir,
                RedirectStandardError = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            },
        };

        process.StartInfo.ArgumentList.Add(scriptPath);
        process.StartInfo.ArgumentList.Add("--input");
        process.StartInfo.ArgumentList.Add(sourcePath);
        process.StartInfo.ArgumentList.Add("--output-dir");
        process.StartInfo.ArgumentList.Add(analysisDir);
        process.StartInfo.ArgumentList.Add("--exercise");
        process.StartInfo.ArgumentList.Add(exerciseType);
        process.StartInfo.ArgumentList.Add("--no-preview");

        var modelPath = _configuration["FormAnalysis:ModelPath"];
        if (!string.IsNullOrWhiteSpace(modelPath))
        {
            process.StartInfo.ArgumentList.Add("--model");
            process.StartInfo.ArgumentList.Add(modelPath);
        }

        try
        {
            process.Start();
            var stdoutTask = process.StandardOutput.ReadToEndAsync(ct);
            var stderrTask = process.StandardError.ReadToEndAsync(ct);
            var completed = await Task.Run(
                () => process.WaitForExit(timeoutSeconds * 1000),
                ct);
            await stdoutTask;
            await stderrTask;

            if (!completed)
            {
                TryKill(process);
                return CreateScriptFailedResult(analysisId, exerciseType);
            }

            if (process.ExitCode != 0)
            {
                return CreateScriptFailedResult(analysisId, exerciseType);
            }

            if (!File.Exists(resultJsonPath))
            {
                return CreateScriptFailedResult(analysisId, exerciseType);
            }

            return await ParsePythonResultAsync(
                analysisId,
                exerciseType,
                resultJsonPath,
                File.Exists(analyzedPath),
                ct);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception)
        {
            return CreateScriptFailedResult(analysisId, exerciseType);
        }
    }

    private async Task<FormAnalysisResultDto> ParsePythonResultAsync(
        Guid analysisId,
        string exerciseType,
        string resultJsonPath,
        bool hasAnalyzedVideo,
        CancellationToken ct)
    {
        await using var stream = File.OpenRead(resultJsonPath);
        using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
        var root = doc.RootElement;

        var findings = new List<string>();
        if (root.TryGetProperty("findings", out var findingsElement) &&
            findingsElement.ValueKind == JsonValueKind.Array)
        {
            findings.AddRange(
                findingsElement.EnumerateArray()
                    .Select(item => item.GetString())
                    .Where(item => !string.IsNullOrWhiteSpace(item))!);
        }

        var metrics = new List<FormAnalysisMetricDto>();
        if (root.TryGetProperty("metrics", out var metricsElement) &&
            metricsElement.ValueKind == JsonValueKind.Object)
        {
            metrics.AddRange(metricsElement.EnumerateObject().Select(metric => new FormAnalysisMetricDto
            {
                Label = metric.Name,
                Value = metric.Value.ToString(),
            }));
        }

        return new FormAnalysisResultDto
        {
            AnalysisId = analysisId,
            ExerciseType = exerciseType,
            Status = root.TryGetProperty("status", out var status)
                ? status.GetString() ?? "completed"
                : "completed",
            Score = root.TryGetProperty("score", out var score) &&
                    score.ValueKind == JsonValueKind.Number &&
                    score.TryGetInt32(out var value)
                ? value
                : null,
            Summary = root.TryGetProperty("summary", out var summary)
                ? summary.GetString() ?? "Analysis completed."
                : "Analysis completed.",
            Findings = findings,
            Metrics = metrics,
            HasSourceVideo = true,
            HasAnalyzedVideo = hasAnalyzedVideo,
        };
    }

    private void ApplyResult(
        FormAnalysisRecord analysis,
        FormAnalysisResultDto result,
        string? analyzedFileName,
        string? rawResultJson)
    {
        var now = DateTime.UtcNow;
        analysis.Status = TrimToMax(result.Status, 40);
        analysis.Score = result.Score;
        analysis.Summary = TrimToMax(result.Summary, 1000);
        analysis.FindingsJson = JsonSerializer.Serialize(result.Findings, JsonOptions);
        analysis.MetricsJson = JsonSerializer.Serialize(result.Metrics, JsonOptions);
        analysis.RawResultJson = rawResultJson;
        analysis.AnalyzedFileName = analyzedFileName;
        analysis.ErrorMessage = IsFailureStatus(result.Status)
            ? TrimToMax(result.Summary, 1000)
            : null;
        analysis.UpdatedAt = now;
        analysis.CompletedAt = now;
    }

    private FormAnalysisResultDto ToDto(FormAnalysisRecord analysis)
    {
        var analysisDir = GetAnalysisDirectory(analysis.OwnerUserId, analysis.Id);
        var sourcePath = Path.Combine(analysisDir, analysis.SourceFileName);
        var analyzedPath = analysis.AnalyzedFileName is null
            ? null
            : Path.Combine(analysisDir, analysis.AnalyzedFileName);

        return new FormAnalysisResultDto
        {
            AnalysisId = analysis.Id,
            WorkoutRunId = analysis.WorkoutRunId,
            WorkoutId = analysis.WorkoutId,
            ExerciseId = analysis.ExerciseId,
            ExerciseName = analysis.ExerciseName,
            ExerciseType = analysis.ExerciseType,
            StepIndex = analysis.StepIndex,
            SetNumber = analysis.SetNumber,
            Status = analysis.Status,
            Score = analysis.Score,
            Summary = analysis.Summary,
            Findings = DeserializeList<string>(analysis.FindingsJson),
            Metrics = DeserializeList<FormAnalysisMetricDto>(analysis.MetricsJson),
            HasSourceVideo = File.Exists(sourcePath),
            HasAnalyzedVideo = analyzedPath is not null && File.Exists(analyzedPath),
            AnalyzerVersion = analysis.AnalyzerVersion,
            ModelName = analysis.ModelName,
            CreatedAt = analysis.CreatedAt,
            CompletedAt = analysis.CompletedAt,
        };
    }

    private static List<T> DeserializeList<T>(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<List<T>>(json, JsonOptions) ?? [];
        }
        catch
        {
            return [];
        }
    }

    private static FormAnalysisResultDto CreateUnsupportedResult(Guid analysisId, string exerciseType) =>
        new()
        {
            AnalysisId = analysisId,
            ExerciseType = exerciseType,
            Status = "unsupported_exercise",
            Summary = "This analyzer currently supports squat and bench press video only.",
            Findings =
            [
                "Choose squat or bench press for the current Python analyzer.",
                "Other exercise types can be added later behind this same upload flow."
            ],
            Metrics = [new() { Label = "Supported now", Value = "Squat, bench press" }],
        };

    private static FormAnalysisResultDto CreateScriptFailedResult(
        Guid analysisId,
        string exerciseType) =>
        new()
        {
            AnalysisId = analysisId,
            ExerciseType = exerciseType,
            Status = "script_failed",
            Summary = "Analysis could not be completed. The recording was saved so you can retry later.",
            Findings =
            [
                "Try a shorter, well-lit clip with the full set in frame.",
                "If this keeps happening, check the analyzer service before retrying."
            ],
            Metrics =
            [
                new() { Label = "Engine", Value = "Python beta" },
                new() { Label = "Status", Value = "Needs retry" }
            ],
        };

    private string? ResolveScriptPath()
    {
        var configuredPath = _configuration["FormAnalysis:ScriptPath"];
        var candidates = new List<string>();

        if (!string.IsNullOrWhiteSpace(configuredPath))
        {
            candidates.Add(configuredPath);
        }

        candidates.Add(Path.Combine(AppContext.BaseDirectory, "videoAnalysysModule", "video.py"));
        candidates.Add("/app/videoAnalysysModule/video.py");
        candidates.AddRange(FindAnalyzerPathsUpwards(AppContext.BaseDirectory));
        candidates.AddRange(FindAnalyzerPathsUpwards(Directory.GetCurrentDirectory()));

        return candidates.FirstOrDefault(File.Exists);
    }

    private static IEnumerable<string> FindAnalyzerPathsUpwards(string startDirectory)
    {
        var directory = new DirectoryInfo(startDirectory);
        while (directory is not null)
        {
            yield return Path.Combine(directory.FullName, "videoAnalysysModule", "video.py");
            directory = directory.Parent;
        }
    }

    private int ResolveTimeoutSeconds()
    {
        var configured = _configuration["FormAnalysis:TimeoutSeconds"];
        if (int.TryParse(configured, out var seconds))
        {
            return Math.Clamp(seconds, 30, 900);
        }

        return 300;
    }

    private long ResolveMaxVideoBytes()
    {
        var configured = _configuration["FormAnalysis:MaxVideoMegabytes"];
        if (int.TryParse(configured, out var megabytes))
        {
            return Math.Clamp(megabytes, 1, DefaultMaxVideoMegabytes) * 1024L * 1024L;
        }

        return MaxVideoBytes;
    }

    private int ResolveMaxAnalysesPerUser()
    {
        var configured = _configuration["FormAnalysis:MaxAnalysesPerUser"];
        if (int.TryParse(configured, out var count))
        {
            return Math.Clamp(count, 5, 200);
        }

        return DefaultMaxAnalysesPerUser;
    }

    private int ResolveRetentionDays()
    {
        var configured = _configuration["FormAnalysis:RetentionDays"];
        if (int.TryParse(configured, out var days))
        {
            return Math.Clamp(days, 1, 365);
        }

        return DefaultRetentionDays;
    }

    private async Task RunRetentionCleanupAsync(Guid ownerId)
    {
        try
        {
            await CleanupOldAnalysesAsync(ownerId);
        }
        catch
        {
        }
    }

    private async Task CleanupOldAnalysesAsync(Guid ownerId)
    {
        var maxAnalyses = ResolveMaxAnalysesPerUser();
        var retentionCutoff = DateTime.UtcNow.AddDays(-ResolveRetentionDays());
        var existingAnalyses = await _db.FormAnalyses
            .Where(analysis => analysis.OwnerUserId == ownerId)
            .OrderByDescending(analysis => analysis.CreatedAt)
            .Select(analysis => new { analysis.Id, analysis.CreatedAt })
            .ToListAsync(CancellationToken.None);

        var staleIds = existingAnalyses
            .Skip(maxAnalyses)
            .Select(analysis => analysis.Id)
            .Concat(
                existingAnalyses
                    .Where(analysis => analysis.CreatedAt < retentionCutoff)
                    .Select(analysis => analysis.Id))
            .Distinct()
            .ToList();

        if (staleIds.Count == 0) return;

        var staleAnalyses = await _db.FormAnalyses
            .Where(analysis => analysis.OwnerUserId == ownerId && staleIds.Contains(analysis.Id))
            .ToListAsync(CancellationToken.None);
        if (staleAnalyses.Count == 0) return;

        _db.FormAnalyses.RemoveRange(staleAnalyses);
        await _db.SaveChangesAsync(CancellationToken.None);

        foreach (var analysis in staleAnalyses)
        {
            DeleteAnalysisDirectory(ownerId, analysis.Id);
        }
    }

    private string? ResolveModelName()
    {
        var modelPath = _configuration["FormAnalysis:ModelPath"];
        return string.IsNullOrWhiteSpace(modelPath)
            ? null
            : TrimToMax(Path.GetFileName(modelPath), 160);
    }

    private static string GetAnalysisDirectory(Guid ownerId, Guid analysisId) =>
        Path.Combine(
            AppContext.BaseDirectory,
            "App_Data",
            "form-analysis",
            ownerId.ToString("N"),
            analysisId.ToString("N"));

    private static void DeleteAnalysisDirectory(Guid ownerId, Guid analysisId)
    {
        var path = GetAnalysisDirectory(ownerId, analysisId);
        try
        {
            if (Directory.Exists(path))
            {
                Directory.Delete(path, recursive: true);
            }
        }
        catch
        {
        }
    }

    private static async Task<string?> ReadRawResultJsonAsync(
        string analysisDir,
        CancellationToken ct)
    {
        var path = Path.Combine(analysisDir, "analysis_result.json");
        return File.Exists(path) ? await File.ReadAllTextAsync(path, ct) : null;
    }

    private static string NormalizeExerciseType(string value)
    {
        var normalized = (value ?? "")
            .Trim()
            .ToLowerInvariant()
            .Replace("-", "_")
            .Replace(" ", "_")
            .Replace("\u0142", "l")
            .Replace("\u00C5\u201A", "l")
            .Replace("\u00E5\u201A", "l");

        normalized = normalized switch
        {
            "bench" or "benchpress" or "lawka" or "wyciskanie" or "wyciskanie_na_lawce" => "bench_press",
            "squats" or "przysiad" or "przysiady" => "squat",
            _ => normalized,
        };

        return string.IsNullOrWhiteSpace(normalized) ? "squat" : normalized;
    }

    private static string ExerciseLabel(string exerciseType) =>
        exerciseType.Equals("bench_press", StringComparison.OrdinalIgnoreCase)
            ? "Bench press beta"
            : "Squat beta";

    private static string NormalizeExtension(string? extension, string contentType)
    {
        if (!string.IsNullOrWhiteSpace(extension) && SupportedExtensions.Contains(extension))
        {
            return extension.ToLowerInvariant();
        }

        var normalizedContentType = NormalizeContentType(contentType);
        return normalizedContentType switch
        {
            "video/mp4" => ".mp4",
            "video/quicktime" => ".mov",
            "video/x-m4v" => ".m4v",
            _ => ".webm",
        };
    }

    private static string GetContentType(string path)
    {
        var extension = Path.GetExtension(path);
        if (extension.Equals(".mp4", StringComparison.OrdinalIgnoreCase))
        {
            return "video/mp4";
        }

        if (extension.Equals(".m4v", StringComparison.OrdinalIgnoreCase))
        {
            return "video/x-m4v";
        }

        return extension.Equals(".mov", StringComparison.OrdinalIgnoreCase)
            ? "video/quicktime"
            : "video/webm";
    }

    private static IFormFile ValidateVideoUpload(IFormFile? video, long maxVideoBytes)
    {
        if (video is null || video.Length == 0)
        {
            throw new InvalidOperationException("Video file is required.");
        }

        if (video.Length > maxVideoBytes)
        {
            var maxMegabytes = Math.Max(1, maxVideoBytes / 1024L / 1024L);
            throw new InvalidOperationException($"Video file is too large. Max size is {maxMegabytes} MB.");
        }

        var extension = Path.GetExtension(video.FileName);
        var contentType = NormalizeContentType(video.ContentType);
        var hasSupportedExtension = !string.IsNullOrWhiteSpace(extension) &&
                                    SupportedExtensions.Contains(extension);
        var hasSupportedContentType = SupportedContentTypes.Contains(contentType);

        if (hasSupportedContentType || hasSupportedExtension && IsOctetStream(contentType))
        {
            return video;
        }

        throw new InvalidOperationException("Unsupported video type. Upload WebM, MP4, MOV, or M4V.");
    }

    private static string NormalizeContentType(string? contentType)
    {
        if (string.IsNullOrWhiteSpace(contentType)) return string.Empty;

        return contentType.Split(';', 2)[0].Trim().ToLowerInvariant();
    }

    private static bool IsOctetStream(string contentType) =>
        string.IsNullOrWhiteSpace(contentType) ||
        contentType.Equals("application/octet-stream", StringComparison.OrdinalIgnoreCase);

    private static void TryKill(Process process)
    {
        try
        {
            if (!process.HasExited)
            {
                process.Kill(entireProcessTree: true);
            }
        }
        catch
        {
            // Best effort cleanup only.
        }
    }

    private static bool IsFailureStatus(string status) =>
        status.Equals("script_failed", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("script_not_configured", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("unsupported_exercise", StringComparison.OrdinalIgnoreCase);

    private static string? TrimOrNull(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return TrimToMax(value.Trim(), maxLength);
    }

    private static string TrimToMax(string value, int maxLength)
    {
        var normalized = value.Trim();
        return normalized.Length <= maxLength ? normalized : normalized[..maxLength];
    }

}
