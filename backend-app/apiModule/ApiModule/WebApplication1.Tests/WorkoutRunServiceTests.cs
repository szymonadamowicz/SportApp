using ApiModule.Api.Contracts.WorkoutRun;
using ApiModule.Application;
using ApiModule.Domain;

namespace ApiModule.Tests;

public sealed class WorkoutRunServiceTests
{
    [Fact]
    public async Task StartAsync_CreatesRunAndBuildsWorkoutSteps()
    {
        var ownerId = Guid.NewGuid();
        var workout = CreateWorkout(ownerId, sets: 2, reps: 8, restSeconds: 60, weight: 40);
        var workouts = new InMemoryWorkoutRepository();
        var runs = new InMemoryWorkoutRunRepository();
        await workouts.AddAsync(workout, CancellationToken.None);
        var service = new WorkoutRunService(workouts, runs, new TestCurrentUser(ownerId));

        var result = await service.StartAsync(workout.Id, CancellationToken.None);

        Assert.NotNull(result);
        Assert.False(result.IsResumed);
        Assert.Equal(workout.Id, result.WorkoutId);
        Assert.Equal(2, result.Steps.Count);
        Assert.All(result.Steps, step => Assert.Equal(60, step.RestSeconds));
        Assert.Single(runs.Runs);
        Assert.Equal(ownerId, runs.Runs[0].OwnerUserId);
    }

    [Fact]
    public async Task SaveProgressAsync_DeduplicatesEntriesAndKeepsResumeState()
    {
        var ownerId = Guid.NewGuid();
        var workout = CreateWorkout(ownerId, sets: 2);
        var run = CreateRun(ownerId, workout);
        var service = CreateService(ownerId, workout, run, out _, out var runs);

        var result = await service.SaveProgressAsync(
            run.Id,
            new SaveWorkoutRunProgressDto
            {
                DurationSec = 125,
                Notes = "  focused set  ",
                ActivePhase = "REST",
                CurrentStepIndex = 1,
                RemainingSeconds = 45,
                PhaseDurationSec = 60,
                IsPaused = true,
                Entries =
                [
                    Entry(workout.Exercises[0], stepIndex: 0, actualReps: 7, metTarget: false),
                    Entry(workout.Exercises[0], stepIndex: 0, actualReps: 8, metTarget: true)
                ],
            },
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.IsResumed);
        Assert.Equal("rest", result.ActivePhase);
        Assert.Equal(1, result.CurrentStepIndex);
        Assert.Equal(45, result.RemainingSeconds);
        Assert.Equal(60, result.PhaseDurationSec);
        Assert.True(result.IsPaused);
        Assert.Equal("focused set", result.Notes);
        Assert.Single(result.Entries);
        Assert.Equal(8, result.Entries[0].ActualReps);
        Assert.True(result.Entries[0].MetTarget);
        Assert.Equal(1, runs.UpdateCalls);
    }

    [Fact]
    public async Task CompleteAsync_ReplacesEntriesMarksWorkoutCompletedAndReturnsSummary()
    {
        var ownerId = Guid.NewGuid();
        var workout = CreateWorkout(ownerId, sets: 2, reps: 10);
        var run = CreateRun(ownerId, workout);
        var service = CreateService(ownerId, workout, run, out _, out var runs);

        var result = await service.CompleteAsync(
            run.Id,
            new CompleteWorkoutRunDto
            {
                DurationSec = 600,
                Notes = "  done  ",
                Entries =
                [
                    Entry(workout.Exercises[0], stepIndex: 0, actualReps: 8, metTarget: false),
                    Entry(workout.Exercises[0], stepIndex: 1, setNumber: 2, actualReps: 10, metTarget: true)
                ],
            },
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(2, result.TotalSets);
        Assert.Equal(1, result.MetTargetSets);
        Assert.Equal(20, result.ExpectedRepsTotal);
        Assert.Equal(18, result.ActualRepsTotal);
        Assert.Equal(50m, result.CompletionRate);
        Assert.NotNull(workout.CompletedAt);
        Assert.NotNull(run.FinishedAt);
        Assert.Equal("done", run.Notes);
        Assert.Equal("summary", run.ActivePhase);
        Assert.True(run.IsPaused);
        Assert.Equal(1, runs.ReplaceEntriesCalls);
    }

    [Fact]
    public async Task GetLatestActiveAsync_ExpiresInactiveRunInsteadOfResuming()
    {
        var ownerId = Guid.NewGuid();
        var workout = CreateWorkout(ownerId);
        var run = CreateRun(ownerId, workout);
        run.StartedAt = DateTime.UtcNow.AddHours(-3);
        run.LastProgressAt = DateTime.UtcNow.AddHours(-2);
        var service = CreateService(ownerId, workout, run, out _, out var runs);

        var result = await service.GetLatestActiveAsync(CancellationToken.None);

        Assert.Null(result);
        Assert.NotNull(run.FinishedAt);
        Assert.True(run.IsPaused);
        Assert.Equal("summary", run.ActivePhase);
        Assert.Equal(1, runs.UpdateCalls);
        Assert.True(run.DurationSec >= 3600);
    }

    private static WorkoutRunService CreateService(
        Guid ownerId,
        Workout workout,
        WorkoutRun run,
        out InMemoryWorkoutRepository workouts,
        out InMemoryWorkoutRunRepository runs)
    {
        workouts = new InMemoryWorkoutRepository();
        runs = new InMemoryWorkoutRunRepository();
        workouts.AddAsync(workout, CancellationToken.None).GetAwaiter().GetResult();
        runs.AddAsync(run, CancellationToken.None).GetAwaiter().GetResult();
        return new WorkoutRunService(workouts, runs, new TestCurrentUser(ownerId));
    }

    private static Workout CreateWorkout(
        Guid ownerId,
        int sets = 1,
        int reps = 8,
        int restSeconds = 60,
        decimal weight = 20)
    {
        var workout = new Workout
        {
            Id = Guid.NewGuid(),
            OwnerUserId = ownerId,
            Title = "Strength day",
            ScheduledAt = DateTime.UtcNow,
        };
        workout.Exercises.Add(new Exercise
        {
            Id = Guid.NewGuid(),
            WorkoutId = workout.Id,
            Workout = workout,
            Name = "Squat",
            Sets = sets,
            Reps = reps,
            RestTimeSec = restSeconds,
            Weight = weight,
        });

        return workout;
    }

    private static WorkoutRun CreateRun(Guid ownerId, Workout workout) =>
        new()
        {
            Id = Guid.NewGuid(),
            WorkoutId = workout.Id,
            Workout = workout,
            OwnerUserId = ownerId,
            StartedAt = DateTime.UtcNow.AddMinutes(-10),
        };

    private static WorkoutRunEntryInputDto Entry(
        Exercise exercise,
        int stepIndex,
        int setNumber = 1,
        int actualReps = 8,
        bool metTarget = true) =>
        new()
        {
            StepIndex = stepIndex,
            ExerciseId = exercise.Id,
            ExerciseName = exercise.Name,
            SetNumber = setNumber,
            ExpectedReps = exercise.Reps,
            ActualReps = actualReps,
            MetTarget = metTarget,
            ExerciseDurationSec = 30,
            RestDurationSec = exercise.RestTimeSec,
            CompletedAt = DateTime.UtcNow,
        };
}
