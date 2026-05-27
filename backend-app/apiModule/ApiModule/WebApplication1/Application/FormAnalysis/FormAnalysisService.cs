using System.Diagnostics;
using System.Text.Json;
using ApiModule.Api.Contracts.FormAnalysis;
using ApiModule.Domain;

namespace ApiModule.Application.FormAnalysis;

public sealed class FormAnalysisService(
    IConfiguration configuration,
    ICurrentUser currentUser)
{
    private const long MaxVideoBytes = 250L * 1024L * 1024L;
    private static readonly HashSet<string> SupportedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".webm", ".mp4", ".mov", ".m4v" };

    private readonly IConfiguration _configuration = configuration;
    private readonly ICurrentUser _currentUser = currentUser;

    public async Task<FormAnalysisResultDto> AnalyzeAsync(
        IFormFile? video,
        string exerciseType,
        CancellationToken ct)
    {
        if (video is null || video.Length == 0)
        {
            throw new InvalidOperationException("Video file is required.");
        }

        if (video.Length > MaxVideoBytes)
        {
            throw new InvalidOperationException("Video file is too large.");
        }

        var normalizedExercise = NormalizeExerciseType(exerciseType);
        var analysisId = Guid.NewGuid();
        var ownerId = _currentUser.UserId;
        var analysisDir = GetAnalysisDirectory(ownerId, analysisId);
        Directory.CreateDirectory(analysisDir);

        var extension = NormalizeExtension(Path.GetExtension(video.FileName), video.ContentType);
        var sourceFileName = $"source{extension}";
        var sourcePath = Path.Combine(analysisDir, sourceFileName);

        await using (var stream = File.Create(sourcePath))
        {
            await video.CopyToAsync(stream, ct);
        }

        var result = normalizedExercise == "squat"
            ? await AnalyzeSquatAsync(analysisId, normalizedExercise, sourcePath, analysisDir, ct)
            : CreateUnsupportedResult(analysisId, normalizedExercise);

        var analyzedFileName = File.Exists(Path.Combine(analysisDir, "analyzed.mp4"))
            ? "analyzed.mp4"
            : null;
        var resultWithVideo = result.WithVideoFlags(
            sourceExists: true,
            analyzedExists: analyzedFileName is not null);

        await SaveMetadataAsync(
            analysisDir,
            new FormAnalysisMetadata
            {
                AnalysisId = analysisId,
                OwnerUserId = ownerId,
                ExerciseType = normalizedExercise,
                SourceFileName = sourceFileName,
                AnalyzedFileName = analyzedFileName,
                Result = resultWithVideo,
            },
            ct);

        return resultWithVideo;
    }

    public async Task<FormAnalysisVideoFile?> GetVideoAsync(
        Guid analysisId,
        string? kind,
        CancellationToken ct)
    {
        var ownerId = _currentUser.UserId;
        var analysisDir = GetAnalysisDirectory(ownerId, analysisId);
        var metadata = await ReadMetadataAsync(analysisDir, ct);
        if (metadata is null || metadata.OwnerUserId != ownerId) return null;

        var useAnalyzed = string.Equals(kind, "analyzed", StringComparison.OrdinalIgnoreCase);
        var fileName = useAnalyzed && metadata.AnalyzedFileName is not null
            ? metadata.AnalyzedFileName
            : metadata.SourceFileName;
        var path = Path.Combine(analysisDir, fileName);

        if (!File.Exists(path)) return null;

        return new FormAnalysisVideoFile
        {
            Path = path,
            ContentType = GetContentType(path),
        };
    }

    private async Task<FormAnalysisResultDto> AnalyzeSquatAsync(
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
                Summary = "Squat analysis is wired up, but the Python script is not available to the API process.",
                Findings =
                [
                    "Set FormAnalysis:ScriptPath or run the API from a workspace that can access backend-app/videoAnalysysModule/video.py.",
                    "Only squat is supported in this first version."
                ],
                Metrics =
                [
                    new() { Label = "Exercise", Value = "Squat beta" },
                    new() { Label = "Engine", Value = "Not configured" }
                ],
            };
        }

        var pythonExecutable = _configuration["FormAnalysis:PythonExecutable"];
        if (string.IsNullOrWhiteSpace(pythonExecutable))
        {
            pythonExecutable = "python";
        }

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

        try
        {
            process.Start();
            var stdoutTask = process.StandardOutput.ReadToEndAsync(ct);
            var stderrTask = process.StandardError.ReadToEndAsync(ct);
            var completed = await Task.Run(() => process.WaitForExit(180_000), ct);
            var stdout = await stdoutTask;
            var stderr = await stderrTask;

            if (!completed)
            {
                TryKill(process);
                return CreateScriptFailedResult(analysisId, exerciseType, "Python analysis timed out.");
            }

            if (process.ExitCode != 0)
            {
                return CreateScriptFailedResult(
                    analysisId,
                    exerciseType,
                    $"Python analysis failed: {TrimForUi(stderr.Length > 0 ? stderr : stdout)}");
            }

            if (!File.Exists(resultJsonPath))
            {
                return CreateScriptFailedResult(
                    analysisId,
                    exerciseType,
                    "Python analysis completed but did not write analysis_result.json.");
            }

            return await ParsePythonResultAsync(
                analysisId,
                exerciseType,
                resultJsonPath,
                File.Exists(analyzedPath),
                ct);
        }
        catch (Exception ex)
        {
            return CreateScriptFailedResult(
                analysisId,
                exerciseType,
                $"Could not run Python analysis: {TrimForUi(ex.Message)}");
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
            Score = root.TryGetProperty("score", out var score) && score.TryGetInt32(out var value)
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

    private static FormAnalysisResultDto CreateUnsupportedResult(Guid analysisId, string exerciseType) =>
        new()
        {
            AnalysisId = analysisId,
            ExerciseType = exerciseType,
            Status = "unsupported_exercise",
            Summary = "This analyzer currently supports squat video only.",
            Findings =
            [
                "Choose squat for the current Python analyzer.",
                "Other exercise types can be added later behind this same upload flow."
            ],
            Metrics = [new() { Label = "Supported now", Value = "Squat" }],
        };

    private static FormAnalysisResultDto CreateScriptFailedResult(
        Guid analysisId,
        string exerciseType,
        string message) =>
        new()
        {
            AnalysisId = analysisId,
            ExerciseType = exerciseType,
            Status = "script_failed",
            Summary = message,
            Findings =
            [
                "The uploaded video was saved successfully.",
                "Check Python dependencies and model paths before retrying analysis."
            ],
            Metrics = [new() { Label = "Engine", Value = "Python script" }],
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
        candidates.Add(Path.GetFullPath(Path.Combine(
            AppContext.BaseDirectory,
            "..",
            "..",
            "..",
            "..",
            "..",
            "..",
            "videoAnalysysModule",
            "video.py")));

        return candidates.FirstOrDefault(File.Exists);
    }

    private static string GetAnalysisDirectory(Guid ownerId, Guid analysisId) =>
        Path.Combine(
            AppContext.BaseDirectory,
            "App_Data",
            "form-analysis",
            ownerId.ToString("N"),
            analysisId.ToString("N"));

    private static async Task SaveMetadataAsync(
        string analysisDir,
        FormAnalysisMetadata metadata,
        CancellationToken ct)
    {
        await using var stream = File.Create(Path.Combine(analysisDir, "metadata.json"));
        await JsonSerializer.SerializeAsync(stream, metadata, cancellationToken: ct);
    }

    private static async Task<FormAnalysisMetadata?> ReadMetadataAsync(
        string analysisDir,
        CancellationToken ct)
    {
        var path = Path.Combine(analysisDir, "metadata.json");
        if (!File.Exists(path)) return null;

        await using var stream = File.OpenRead(path);
        return await JsonSerializer.DeserializeAsync<FormAnalysisMetadata>(stream, cancellationToken: ct);
    }

    private static string NormalizeExerciseType(string value)
    {
        var normalized = (value ?? "").Trim().ToLowerInvariant();
        return string.IsNullOrWhiteSpace(normalized) ? "squat" : normalized;
    }

    private static string NormalizeExtension(string? extension, string contentType)
    {
        if (!string.IsNullOrWhiteSpace(extension) && SupportedExtensions.Contains(extension))
        {
            return extension.ToLowerInvariant();
        }

        return contentType.Contains("mp4", StringComparison.OrdinalIgnoreCase)
            ? ".mp4"
            : ".webm";
    }

    private static string GetContentType(string path)
    {
        var extension = Path.GetExtension(path);
        return extension.Equals(".mp4", StringComparison.OrdinalIgnoreCase) ||
               extension.Equals(".m4v", StringComparison.OrdinalIgnoreCase) ||
               extension.Equals(".mov", StringComparison.OrdinalIgnoreCase)
            ? "video/mp4"
            : "video/webm";
    }

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

    private static string TrimForUi(string value)
    {
        var normalized = value.Trim();
        return normalized.Length <= 220 ? normalized : normalized[..220];
    }
}

internal static class FormAnalysisResultExtensions
{
    public static FormAnalysisResultDto WithVideoFlags(
        this FormAnalysisResultDto dto,
        bool sourceExists,
        bool analyzedExists) =>
        new()
        {
            AnalysisId = dto.AnalysisId,
            ExerciseType = dto.ExerciseType,
            Status = dto.Status,
            Score = dto.Score,
            Summary = dto.Summary,
            Findings = dto.Findings,
            Metrics = dto.Metrics,
            HasSourceVideo = sourceExists,
            HasAnalyzedVideo = analyzedExists,
        };
}
