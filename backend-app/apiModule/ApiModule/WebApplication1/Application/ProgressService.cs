using ApiModule.Api.Contracts.Progress;
using ApiModule.Application.Enums;
using ApiModule.Domain;

namespace ApiModule.Application;

public sealed class ProgressService(IWorkoutRepository repo, ICurrentUser currentUser)
{
    private readonly IWorkoutRepository _repo = repo;
    private readonly ICurrentUser _currentUser = currentUser;

    public async Task<ProgressDto> GetProgressAsync(
  PrScope scope,
  CancellationToken ct)
    {
        var workouts = await _repo.GetAllByOwnerAsync(_currentUser.UserId, ct);

        var allCompleted = workouts
            .Where(w => w.CompletedAt.HasValue)
            .ToList();

        var streak = CalculateStreak(allCompleted);

        var scopedCompleted = allCompleted;

        if (scope == PrScope.Week)
        {
            var startOfWeek = GetStartOfWeekUtc(DateTime.UtcNow);
            scopedCompleted = [.. allCompleted.Where(w => w.CompletedAt >= startOfWeek)];
        }

        return new ProgressDto
        {
            Streak = streak,
            Stats = CalculateStats(scopedCompleted),
            Prs = CalculatePrs(scopedCompleted)
        };
    }

    private static StreakDto CalculateStreak(List<Workout> workouts)
    {
        if (workouts.Count == 0)
            return new StreakDto();

        var days = workouts
            .Select(w => w.CompletedAt!.Value.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToList();

        var today = DateTime.UtcNow.Date;
        var latestDay = days[0];

        var current = 0;
        if (latestDay == today || latestDay == today.AddDays(-1))
        {
            current = 1;

            for (var i = 1; i < days.Count; i++)
            {
                if (days[i] != days[i - 1].AddDays(-1))
                    break;

                current++;
            }
        }

        var longest = 1;
        var run = 1;
        for (var i = 1; i < days.Count; i++)
        {
            if (days[i] == days[i - 1].AddDays(-1))
            {
                run++;
                longest = Math.Max(longest, run);
            }
            else
            {
                run = 1;
            }
        }

        return new StreakDto
        {
            Current = current,
            Longest = longest,
            LastWorkoutDate = latestDay
        };
    }

    private static ProgressStatsDto CalculateStats(List<Workout> workouts)
    {
        var exercises = workouts.SelectMany(w => w.Exercises).ToList();

        return new ProgressStatsDto
        {
            TotalWorkouts = workouts.Count,
            TotalReps = exercises.Sum(e => e.Sets * e.Reps),
            TotalVolume = exercises.Sum(e => e.Sets * e.Reps * e.Weight),
            MaxWeight = exercises.Count == 0 ? 0 : exercises.Max(e => e.Weight)
        };
    }

    private static List<PrDto> CalculatePrs(List<Workout> workouts)
    {
        return [.. workouts
            .SelectMany(w => w.Exercises)
            .GroupBy(e => e.Name)
            .Select(g => new PrDto
            {
                ExerciseName = g.Key,
                MaxWeight = g.Max(e => e.Weight)
            })
            .OrderByDescending(p => p.MaxWeight)];
    }
    private static DateTime GetStartOfWeekUtc(DateTime now)
    {
        var diff = (7 + (now.DayOfWeek - DayOfWeek.Monday)) % 7;
        return now.Date.AddDays(-diff);
    }
}
