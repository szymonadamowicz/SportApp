using ApiModule.Api.Contracts.WorkoutRun;
using ApiModule.Domain;

namespace ApiModule.Application;

public sealed class WorkoutRunService(
    IWorkoutRepository workouts,
    IWorkoutRunRepository workoutRuns,
    ICurrentUser currentUser)
{
    private readonly IWorkoutRepository _workouts = workouts;
    private readonly IWorkoutRunRepository _workoutRuns = workoutRuns;
    private readonly ICurrentUser _currentUser = currentUser;

    public async Task<WorkoutRunStartDto?> GetActiveAsync(Guid workoutId, CancellationToken ct)
    {
        var run = await _workoutRuns.GetActiveByWorkoutForOwnerAsync(workoutId, _currentUser.UserId, ct);
        if (run is null || run.Workout is null) return null;

        return BuildRunStartDto(run, run.Workout, isResumed: true);
    }

    public async Task<WorkoutRunStartDto?> StartAsync(Guid workoutId, CancellationToken ct)
    {
        var activeRun = await _workoutRuns.GetActiveByWorkoutForOwnerAsync(workoutId, _currentUser.UserId, ct);
        if (activeRun is not null && activeRun.Workout is not null)
        {
            return BuildRunStartDto(activeRun, activeRun.Workout, isResumed: true);
        }

        var workout = await _workouts.GetByIdForOwnerAsync(workoutId, _currentUser.UserId, ct);
        if (workout is null) return null;

        var run = new WorkoutRun
        {
            Id = Guid.NewGuid(),
            WorkoutId = workout.Id,
            OwnerUserId = _currentUser.UserId,
            StartedAt = DateTime.UtcNow,
        };

        await _workoutRuns.AddAsync(run, ct);

        return BuildRunStartDto(run, workout, isResumed: false);
    }

    public async Task<WorkoutRunStartDto?> SaveProgressAsync(
        Guid runId,
        SaveWorkoutRunProgressDto dto,
        CancellationToken ct)
    {
        var run = await _workoutRuns.GetByIdForOwnerAsync(runId, _currentUser.UserId, ct);
        if (run is null || run.Workout is null) return null;
        if (run.FinishedAt.HasValue) return BuildRunStartDto(run, run.Workout, isResumed: true);

        UpsertRunEntries(run, dto.Entries);

        if (dto.DurationSec.HasValue)
        {
            run.DurationSec = dto.DurationSec.Value;
        }

        run.Notes = string.IsNullOrWhiteSpace(dto.Notes)
            ? null
            : dto.Notes.Trim();

        await _workoutRuns.UpdateAsync(run, ct);

        return BuildRunStartDto(run, run.Workout, isResumed: true);
    }

    public async Task<WorkoutRunSummaryDto?> CompleteAsync(
        Guid runId,
        CompleteWorkoutRunDto dto,
        CancellationToken ct)
    {
        var run = await _workoutRuns.GetByIdForOwnerAsync(runId, _currentUser.UserId, ct);
        if (run is null || run.Workout is null) return null;

        UpsertRunEntries(run, dto.Entries);

        var finishedAt = DateTime.UtcNow;
        run.FinishedAt = finishedAt;
        run.DurationSec = dto.DurationSec;
        run.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();

        run.Workout.CompletedAt = finishedAt;

        await _workoutRuns.UpdateAsync(run, ct);

        var totalSets = run.Entries.Count;
        var metTargetSets = run.Entries.Count(e => e.MetTarget);
        var expectedTotal = run.Entries.Sum(e => e.ExpectedReps);
        var actualTotal = run.Entries.Sum(e => e.ActualReps);

        var completionRate = totalSets == 0
            ? 0
            : Math.Round((decimal)metTargetSets / totalSets * 100m, 2);

        return new WorkoutRunSummaryDto
        {
            RunId = run.Id,
            WorkoutId = run.WorkoutId,
            FinishedAt = finishedAt,
            TotalSets = totalSets,
            MetTargetSets = metTargetSets,
            ExpectedRepsTotal = expectedTotal,
            ActualRepsTotal = actualTotal,
            CompletionRate = completionRate,
        };
    }

    private static void UpsertRunEntries(WorkoutRun run, List<WorkoutRunEntryInputDto> entries)
    {
        var existingByStepIndex = run.Entries.ToDictionary(e => e.StepIndex);
        var incomingStepIndexes = new HashSet<int>();

        foreach (var entry in entries)
        {
            incomingStepIndexes.Add(entry.StepIndex);

            if (existingByStepIndex.TryGetValue(entry.StepIndex, out var tracked))
            {
                tracked.ExerciseId = entry.ExerciseId;
                tracked.ExerciseName = entry.ExerciseName;
                tracked.StepIndex = entry.StepIndex;
                tracked.SetNumber = entry.SetNumber;
                tracked.ExpectedReps = entry.ExpectedReps;
                tracked.ActualReps = entry.ActualReps;
                tracked.MetTarget = entry.MetTarget;
                tracked.ExerciseDurationSec = entry.ExerciseDurationSec;
                tracked.RestDurationSec = entry.RestDurationSec;
                tracked.CompletedAt = entry.CompletedAt ?? DateTime.UtcNow;
                continue;
            }

            run.Entries.Add(new WorkoutRunEntry
            {
                Id = Guid.NewGuid(),
                WorkoutRunId = run.Id,
                ExerciseId = entry.ExerciseId,
                ExerciseName = entry.ExerciseName,
                StepIndex = entry.StepIndex,
                SetNumber = entry.SetNumber,
                ExpectedReps = entry.ExpectedReps,
                ActualReps = entry.ActualReps,
                MetTarget = entry.MetTarget,
                ExerciseDurationSec = entry.ExerciseDurationSec,
                RestDurationSec = entry.RestDurationSec,
                CompletedAt = entry.CompletedAt ?? DateTime.UtcNow,
            });
        }

        run.Entries.RemoveAll(existing => !incomingStepIndexes.Contains(existing.StepIndex));
    }

    private static WorkoutRunStartDto BuildRunStartDto(WorkoutRun run, Workout workout, bool isResumed)
    {
        var steps = BuildSteps(workout);
        var entries = run.Entries
            .OrderBy(entry => entry.StepIndex)
            .Select(entry => new WorkoutRunEntryDto
            {
                StepIndex = entry.StepIndex,
                ExerciseId = entry.ExerciseId,
                ExerciseName = entry.ExerciseName,
                SetNumber = entry.SetNumber,
                ExpectedReps = entry.ExpectedReps,
                ActualReps = entry.ActualReps,
                MetTarget = entry.MetTarget,
                ExerciseDurationSec = entry.ExerciseDurationSec,
                RestDurationSec = entry.RestDurationSec,
                CompletedAt = entry.CompletedAt,
            })
            .ToList();

        var completedStepIndexes = entries
            .Select(entry => entry.StepIndex)
            .ToHashSet();

        var nextStepIndex = steps
            .FirstOrDefault(step => !completedStepIndexes.Contains(step.StepIndex))
            ?.StepIndex ?? steps.Count;

        return new WorkoutRunStartDto
        {
            RunId = run.Id,
            WorkoutId = workout.Id,
            WorkoutTitle = workout.Title,
            StartedAt = run.StartedAt,
            IsResumed = isResumed || entries.Count > 0,
            NextStepIndex = nextStepIndex,
            DurationSec = run.DurationSec,
            Notes = run.Notes,
            Entries = entries,
            Steps = steps,
        };
    }

    private static List<WorkoutRunStepDto> BuildSteps(Workout workout)
    {
        var steps = new List<WorkoutRunStepDto>();
        var stepIndex = 0;

        foreach (var exercise in workout.Exercises)
        {
            var totalSets = Math.Max(1, exercise.Sets);
            var expectedReps = Math.Max(1, exercise.Reps);
            var restSeconds = Math.Max(15, exercise.RestTimeSec);
            var exerciseSeconds = EstimateSetSeconds(expectedReps, exercise.Weight);

            for (var set = 1; set <= totalSets; set++)
            {
                steps.Add(new WorkoutRunStepDto
                {
                    StepIndex = stepIndex,
                    ExerciseId = exercise.Id,
                    ExerciseName = exercise.Name,
                    SetNumber = set,
                    TotalSets = totalSets,
                    ExpectedReps = expectedReps,
                    ExpectedWeight = exercise.Weight,
                    RestSeconds = restSeconds,
                    ExerciseSeconds = exerciseSeconds,
                });

                stepIndex++;
            }
        }

        return steps;
    }

    private static int EstimateSetSeconds(int expectedReps, decimal expectedWeight)
    {
        var reps = Math.Max(1, expectedReps);
        var secondsPerRep = reps <= 5 ? 5 : reps <= 10 ? 4 : 3;
        var loadAdjustment = expectedWeight <= 0
            ? 0
            : expectedWeight < 40
                ? 4
                : expectedWeight < 80
                    ? 8
                    : 12;

        return Math.Clamp(10 + reps * secondsPerRep + loadAdjustment, 20, 180);
    }
}
