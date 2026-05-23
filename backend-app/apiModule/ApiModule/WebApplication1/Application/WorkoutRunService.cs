using ApiModule.Api.Contracts.WorkoutRun;
using ApiModule.Domain;

namespace ApiModule.Application;

public sealed class WorkoutRunService(
    IWorkoutRepository workouts,
    IWorkoutRunRepository workoutRuns,
    ICurrentUser currentUser)
{
    private static readonly HashSet<string> RestorablePhases = ["exercise", "rest", "summary"];
    private static readonly TimeSpan InactivityTimeout = TimeSpan.FromHours(1);

    private readonly IWorkoutRepository _workouts = workouts;
    private readonly IWorkoutRunRepository _workoutRuns = workoutRuns;
    private readonly ICurrentUser _currentUser = currentUser;

    public async Task<WorkoutRunStartDto?> GetActiveAsync(Guid workoutId, CancellationToken ct)
    {
        var run = await _workoutRuns.GetActiveByWorkoutForOwnerAsync(workoutId, _currentUser.UserId, ct);
        if (run is null || run.Workout is null) return null;
        if (await ExpireIfInactiveAsync(run, ct)) return null;

        return BuildRunStartDto(run, run.Workout, isResumed: true);
    }

    public async Task<WorkoutRunStartDto?> GetLatestActiveAsync(CancellationToken ct)
    {
        var run = await _workoutRuns.GetLatestActiveForOwnerAsync(_currentUser.UserId, ct);
        if (run is null || run.Workout is null) return null;
        if (await ExpireIfInactiveAsync(run, ct)) return null;

        return BuildRunStartDto(run, run.Workout, isResumed: true);
    }

    public async Task<WorkoutRunStartDto?> StartAsync(Guid workoutId, CancellationToken ct)
    {
        var activeRun = await _workoutRuns.GetActiveByWorkoutForOwnerAsync(workoutId, _currentUser.UserId, ct);
        if (activeRun is not null && activeRun.Workout is not null)
        {
            if (await ExpireIfInactiveAsync(activeRun, ct))
            {
                activeRun = null;
            }
        }

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

    public async Task<bool> CancelAsync(Guid runId, CancellationToken ct)
    {
        var run = await _workoutRuns.GetByIdForOwnerAsync(runId, _currentUser.UserId, ct);
        if (run is null) return false;
        if (run.FinishedAt.HasValue) return true;

        FinishRunWithoutCompletingWorkout(run, DateTime.UtcNow);
        await _workoutRuns.UpdateAsync(run, ct);

        return true;
    }

    public async Task<WorkoutRunStartDto?> SaveProgressAsync(
        Guid runId,
        SaveWorkoutRunProgressDto dto,
        CancellationToken ct)
    {
        var run = await _workoutRuns.GetByIdForOwnerAsync(runId, _currentUser.UserId, ct);
        if (run is null || run.Workout is null) return null;
        if (IsInactive(run))
        {
            FinishRunWithoutCompletingWorkout(run, DateTime.UtcNow);
            await _workoutRuns.UpdateAsync(run, ct);
            return null;
        }
        if (run.FinishedAt.HasValue) return BuildRunStartDto(run, run.Workout, isResumed: true);

        UpsertRunEntries(run, dto.Entries, removeMissingEntries: false);

        if (dto.DurationSec.HasValue)
        {
            run.DurationSec = dto.DurationSec.Value;
        }

        run.Notes = string.IsNullOrWhiteSpace(dto.Notes)
            ? null
            : dto.Notes.Trim();

        ApplyRunProgressState(run, dto);

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
        if (IsInactive(run))
        {
            FinishRunWithoutCompletingWorkout(run, DateTime.UtcNow);
            await _workoutRuns.UpdateAsync(run, ct);
            return null;
        }

        var finalEntries = BuildReplacementEntries(run.Id, dto.Entries);

        var finishedAt = DateTime.UtcNow;
        run.FinishedAt = finishedAt;
        run.DurationSec = dto.DurationSec;
        run.Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim();
        run.ActivePhase = "summary";
        run.IsPaused = true;
        run.RemainingSeconds = 0;
        run.PhaseDurationSec = 0;
        run.LastProgressAt = finishedAt;

        run.Workout.CompletedAt = finishedAt;

        await _workoutRuns.ReplaceEntriesAndUpdateAsync(run, finalEntries, ct);

        var totalSets = finalEntries.Count;
        var metTargetSets = finalEntries.Count(e => e.MetTarget);
        var expectedTotal = finalEntries.Sum(e => e.ExpectedReps);
        var actualTotal = finalEntries.Sum(e => e.ActualReps);

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

    private static List<WorkoutRunEntry> BuildReplacementEntries(
        Guid runId,
        List<WorkoutRunEntryInputDto> entries)
    {
        return entries
            .GroupBy(entry => entry.StepIndex)
            .Select(group => group.Last())
            .OrderBy(entry => entry.StepIndex)
            .Select(entry => new WorkoutRunEntry
            {
                Id = Guid.NewGuid(),
                WorkoutRunId = runId,
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
            })
            .ToList();
    }

    private static void UpsertRunEntries(
        WorkoutRun run,
        List<WorkoutRunEntryInputDto> entries,
        bool removeMissingEntries)
    {
        RemoveDuplicateTrackedEntries(run);

        var existingByStepIndex = run.Entries
            .GroupBy(e => e.StepIndex)
            .ToDictionary(group => group.Key, group => group.OrderByDescending(e => e.CompletedAt).First());
        var incomingStepIndexes = new HashSet<int>();

        foreach (var entry in entries
            .GroupBy(entry => entry.StepIndex)
            .Select(group => group.Last()))
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

        if (removeMissingEntries)
        {
            run.Entries.RemoveAll(existing => !incomingStepIndexes.Contains(existing.StepIndex));
        }
    }

    private static void RemoveDuplicateTrackedEntries(WorkoutRun run)
    {
        var duplicates = run.Entries
            .GroupBy(entry => entry.StepIndex)
            .SelectMany(group => group
                .OrderByDescending(entry => entry.CompletedAt)
                .Skip(1))
            .ToList();

        foreach (var duplicate in duplicates)
        {
            run.Entries.Remove(duplicate);
        }
    }

    private static void ApplyRunProgressState(WorkoutRun run, SaveWorkoutRunProgressDto dto)
    {
        if (!string.IsNullOrWhiteSpace(dto.ActivePhase))
        {
            var normalizedPhase = dto.ActivePhase.Trim().ToLowerInvariant();
            if (RestorablePhases.Contains(normalizedPhase))
            {
                run.ActivePhase = normalizedPhase;
            }
        }

        if (dto.CurrentStepIndex.HasValue)
        {
            run.CurrentStepIndex = Math.Max(0, dto.CurrentStepIndex.Value);
        }

        if (dto.RemainingSeconds.HasValue)
        {
            run.RemainingSeconds = dto.RemainingSeconds.Value;
        }

        if (dto.PhaseDurationSec.HasValue)
        {
            run.PhaseDurationSec = Math.Max(0, dto.PhaseDurationSec.Value);
        }

        if (dto.IsPaused.HasValue)
        {
            run.IsPaused = dto.IsPaused.Value;
        }

        run.LastProgressAt = DateTime.UtcNow;
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

        var hasSavedResumeState = run.LastProgressAt.HasValue;
        var fallbackStepIndex = nextStepIndex >= steps.Count
            ? Math.Max(0, steps.Count - 1)
            : nextStepIndex;
        var requestedStepIndex = hasSavedResumeState
            ? run.CurrentStepIndex
            : fallbackStepIndex;
        var currentStepIndex = steps.Count == 0
            ? 0
            : Math.Clamp(requestedStepIndex, 0, Math.Max(0, steps.Count - 1));

        var activePhase = hasSavedResumeState && RestorablePhases.Contains(run.ActivePhase)
            ? run.ActivePhase
            : "exercise";
        var timerSnapshot = BuildTimerSnapshot(run, activePhase, hasSavedResumeState);
        var durationSec = run.FinishedAt.HasValue
            ? run.DurationSec
            : Math.Max(
                run.DurationSec ?? 0,
                (int)Math.Floor(Math.Max(0, (DateTime.UtcNow - run.StartedAt).TotalSeconds)));

        return new WorkoutRunStartDto
        {
            RunId = run.Id,
            WorkoutId = workout.Id,
            WorkoutTitle = workout.Title,
            StartedAt = run.StartedAt,
            IsResumed = isResumed || entries.Count > 0,
            NextStepIndex = nextStepIndex,
            ActivePhase = activePhase,
            CurrentStepIndex = currentStepIndex,
            RemainingSeconds = timerSnapshot.RemainingSeconds,
            PhaseDurationSec = hasSavedResumeState ? run.PhaseDurationSec : null,
            IsPaused = hasSavedResumeState && run.IsPaused,
            LastProgressAt = timerSnapshot.LastProgressAt,
            DurationSec = durationSec,
            Notes = run.Notes,
            Entries = entries,
            Steps = steps,
        };
    }

    private async Task<bool> ExpireIfInactiveAsync(WorkoutRun run, CancellationToken ct)
    {
        if (!IsInactive(run)) return false;

        FinishRunWithoutCompletingWorkout(run, DateTime.UtcNow);
        await _workoutRuns.UpdateAsync(run, ct);

        return true;
    }

    private static bool IsInactive(WorkoutRun run)
    {
        if (run.FinishedAt.HasValue) return false;

        var lastActivityAt = run.LastProgressAt ?? run.StartedAt;
        return DateTime.UtcNow - lastActivityAt >= InactivityTimeout;
    }

    private static void FinishRunWithoutCompletingWorkout(WorkoutRun run, DateTime finishedAt)
    {
        run.FinishedAt = finishedAt;
        run.DurationSec = Math.Max(
            run.DurationSec ?? 0,
            (int)Math.Floor(Math.Max(0, (finishedAt - run.StartedAt).TotalSeconds)));
        run.ActivePhase = "summary";
        run.IsPaused = true;
        run.RemainingSeconds = 0;
        run.PhaseDurationSec = 0;
        run.LastProgressAt = finishedAt;
    }

    private static (int? RemainingSeconds, DateTime? LastProgressAt) BuildTimerSnapshot(
        WorkoutRun run,
        string activePhase,
        bool hasSavedResumeState)
    {
        if (!hasSavedResumeState)
        {
            return (null, null);
        }

        if (
            run.RemainingSeconds is not { } remainingSeconds ||
            run.LastProgressAt is not { } lastProgressAt ||
            run.IsPaused ||
            activePhase == "summary")
        {
            return (run.RemainingSeconds, run.LastProgressAt);
        }

        var now = DateTime.UtcNow;
        var elapsedSeconds = (int)Math.Floor(Math.Max(0, (now - lastProgressAt).TotalSeconds));

        return (remainingSeconds - elapsedSeconds, now);
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
