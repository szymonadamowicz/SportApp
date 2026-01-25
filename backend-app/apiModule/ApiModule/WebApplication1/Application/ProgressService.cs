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

        var completed = workouts
            .Where(w => w.CompletedAt.HasValue)
            .ToList();

        if (scope == PrScope.Week)
        {
            var startOfWeek = GetStartOfWeekUtc(DateTime.UtcNow);
            completed = [.. completed.Where(w => w.CompletedAt >= startOfWeek)];
        }

        return new ProgressDto
        {
            Streak = CalculateStreak(completed),
            Stats = CalculateStats(completed),
            Prs = CalculatePrs(completed)
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

        int current = 0;
        int longest = 0;
        int temp = 0;

        DateTime? lastDate = days.FirstOrDefault();

        foreach (var day in days)
        {
            if (temp == 0)
            {
                if (day != today)
                    break;

                temp = 1;
                current = 1;
                longest = 1;
                continue;
            }

            var expected = days[temp - 1].AddDays(-1);

            if (day == expected)
            {
                temp++;
                current++;
                longest = Math.Max(longest, temp);
            }
            else
            {
                longest = Math.Max(longest, temp);
                break;
            }
        }

        return new StreakDto
        {
            Current = current,
            Longest = longest,
            LastWorkoutDate = lastDate
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
