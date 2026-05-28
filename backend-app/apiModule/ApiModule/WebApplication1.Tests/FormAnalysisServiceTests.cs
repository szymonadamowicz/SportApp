using ApiModule.Api.Contracts.FormAnalysis;
using ApiModule.Application.FormAnalysis;
using ApiModule.Domain;
using ApiModule.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace ApiModule.Tests;

public sealed class FormAnalysisServiceTests
{
    [Fact]
    public async Task AnalyzeAsync_PersistsUnsupportedExerciseWithSourceVideoAndContext()
    {
        var ownerId = Guid.NewGuid();
        await using var db = CreateDbContext();
        var (workout, run) = await SeedWorkoutRunAsync(db, ownerId);
        var service = CreateService(db, ownerId);

        try
        {
            var result = await service.AnalyzeAsync(
                new FormAnalysisUploadRequest
                {
                    Video = CreateVideo("set.webm", "video/webm"),
                    ExerciseType = "other",
                    WorkoutRunId = run.Id,
                    ExerciseId = workout.Exercises[0].Id,
                    ExerciseName = "Squat",
                    StepIndex = 0,
                    SetNumber = 1,
                },
                CancellationToken.None);

            var persisted = await db.FormAnalyses.SingleAsync(CancellationToken.None);
            var listed = await service.ListAsync(run.Id, null, CancellationToken.None);
            var video = await service.GetVideoAsync(result.AnalysisId, "source", CancellationToken.None);

            Assert.Equal("unsupported_exercise", result.Status);
            Assert.True(result.HasSourceVideo);
            Assert.False(result.HasAnalyzedVideo);
            Assert.Equal(ownerId, persisted.OwnerUserId);
            Assert.Equal(run.Id, persisted.WorkoutRunId);
            Assert.Equal(workout.Id, persisted.WorkoutId);
            Assert.Equal("unsupported_exercise", persisted.Status);
            Assert.NotNull(persisted.ErrorMessage);
            Assert.Single(listed);
            Assert.NotNull(video);
            Assert.True(File.Exists(video.Path));
        }
        finally
        {
            DeleteOwnerAnalysisDirectory(ownerId);
        }
    }

    [Fact]
    public async Task AnalyzeAsync_EnforcesRetentionLimitAndDeletesStaleFiles()
    {
        var ownerId = Guid.NewGuid();
        await using var db = CreateDbContext();
        var (workout, run) = await SeedWorkoutRunAsync(db, ownerId);
        var staleIds = Enumerable.Range(0, 5)
            .Select(_ => Guid.NewGuid())
            .ToList();
        var staleOldestId = Guid.NewGuid();
        for (var index = 0; index < staleIds.Count; index++)
        {
            await SeedAnalysisAsync(db, ownerId, staleIds[index], DateTime.UtcNow.AddDays(-(index + 1)));
            Directory.CreateDirectory(GetAnalysisDirectory(ownerId, staleIds[index]));
        }

        await SeedAnalysisAsync(db, ownerId, staleOldestId, DateTime.UtcNow.AddDays(-10));
        Directory.CreateDirectory(GetAnalysisDirectory(ownerId, staleOldestId));
        var service = CreateService(
            db,
            ownerId,
            new Dictionary<string, string?>
            {
                ["FormAnalysis:MaxAnalysesPerUser"] = "5",
                ["FormAnalysis:RetentionDays"] = "365",
            });

        try
        {
            var result = await service.AnalyzeAsync(
                new FormAnalysisUploadRequest
                {
                    Video = CreateVideo("set.webm", "video/webm"),
                    ExerciseType = "other",
                    WorkoutRunId = run.Id,
                    WorkoutId = workout.Id,
                },
                CancellationToken.None);

            var remainingIds = await db.FormAnalyses
                .Where(analysis => analysis.OwnerUserId == ownerId)
                .OrderByDescending(analysis => analysis.CreatedAt)
                .Select(analysis => analysis.Id)
                .ToListAsync(CancellationToken.None);

            Assert.Equal([result.AnalysisId, ..staleIds.Take(4)], remainingIds);
            Assert.True(Directory.Exists(GetAnalysisDirectory(ownerId, staleIds[0])));
            Assert.False(Directory.Exists(GetAnalysisDirectory(ownerId, staleOldestId)));
        }
        finally
        {
            DeleteOwnerAnalysisDirectory(ownerId);
        }
    }

    private static FormAnalysisService CreateService(
        AppDbContext db,
        Guid ownerId,
        Dictionary<string, string?>? overrides = null)
    {
        var settings = new Dictionary<string, string?>
        {
            ["FormAnalysis:MaxVideoMegabytes"] = "1",
            ["FormAnalysis:TimeoutSeconds"] = "30",
            ["FormAnalysis:MaxAnalysesPerUser"] = "50",
            ["FormAnalysis:RetentionDays"] = "30",
        };

        if (overrides is not null)
        {
            foreach (var item in overrides)
            {
                settings[item.Key] = item.Value;
            }
        }

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();

        return new FormAnalysisService(configuration, new TestCurrentUser(ownerId), db);
    }

    private static AppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        return new AppDbContext(options);
    }

    private static async Task<(Workout Workout, WorkoutRun Run)> SeedWorkoutRunAsync(
        AppDbContext db,
        Guid ownerId)
    {
        var workout = new Workout
        {
            Id = Guid.NewGuid(),
            OwnerUserId = ownerId,
            Title = "Video day",
            ScheduledAt = DateTime.UtcNow,
        };
        workout.Exercises.Add(new Exercise
        {
            Id = Guid.NewGuid(),
            WorkoutId = workout.Id,
            Workout = workout,
            Name = "Squat",
            Sets = 1,
            Reps = 8,
            RestTimeSec = 60,
            Weight = 60,
        });
        var run = new WorkoutRun
        {
            Id = Guid.NewGuid(),
            WorkoutId = workout.Id,
            Workout = workout,
            OwnerUserId = ownerId,
            StartedAt = DateTime.UtcNow.AddMinutes(-5),
        };

        db.Workouts.Add(workout);
        db.WorkoutRuns.Add(run);
        await db.SaveChangesAsync(CancellationToken.None);
        return (workout, run);
    }

    private static async Task SeedAnalysisAsync(
        AppDbContext db,
        Guid ownerId,
        Guid analysisId,
        DateTime createdAt)
    {
        db.FormAnalyses.Add(new ApiModule.Domain.FormAnalysis
        {
            Id = analysisId,
            OwnerUserId = ownerId,
            ExerciseType = "squat",
            Status = "completed",
            Summary = "Seed analysis",
            FindingsJson = "[]",
            MetricsJson = "[]",
            SourceFileName = "source.webm",
            AnalyzerVersion = "test",
            CreatedAt = createdAt,
            UpdatedAt = createdAt,
            CompletedAt = createdAt,
        });
        await db.SaveChangesAsync(CancellationToken.None);
    }

    private static IFormFile CreateVideo(string fileName, string contentType)
    {
        var bytes = new byte[] { 1, 2, 3, 4, 5 };
        var stream = new MemoryStream(bytes);
        return new FormFile(stream, 0, bytes.Length, "video", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType,
        };
    }

    private static string GetAnalysisDirectory(Guid ownerId, Guid analysisId) =>
        Path.Combine(
            AppContext.BaseDirectory,
            "App_Data",
            "form-analysis",
            ownerId.ToString("N"),
            analysisId.ToString("N"));

    private static void DeleteOwnerAnalysisDirectory(Guid ownerId)
    {
        var path = Path.Combine(
            AppContext.BaseDirectory,
            "App_Data",
            "form-analysis",
            ownerId.ToString("N"));
        if (Directory.Exists(path))
        {
            Directory.Delete(path, recursive: true);
        }
    }
}
