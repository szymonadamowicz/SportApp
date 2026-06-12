using ApiModule.Application;
using ApiModule.Application.Enums;
using ApiModule.Domain;

namespace ApiModule.Tests;

public sealed class ProgressServiceTests
{
    [Fact]
    public async Task GetProgressAsync_KeepsCurrentStreakWhenLatestWorkoutWasYesterday()
    {
        var ownerId = Guid.NewGuid();
        var workouts = new InMemoryWorkoutRepository();
        await workouts.AddAsync(CompletedWorkout(ownerId, DateTime.UtcNow.Date.AddDays(-2)), CancellationToken.None);
        await workouts.AddAsync(CompletedWorkout(ownerId, DateTime.UtcNow.Date.AddDays(-1)), CancellationToken.None);
        var service = new ProgressService(workouts, new TestCurrentUser(ownerId));

        var progress = await service.GetProgressAsync(PrScope.All, CancellationToken.None);

        Assert.Equal(2, progress.Streak.Current);
        Assert.Equal(2, progress.Streak.Longest);
    }

    [Fact]
    public async Task GetProgressAsync_CalculatesLongestStreakEvenWhenCurrentStreakIsBroken()
    {
        var ownerId = Guid.NewGuid();
        var workouts = new InMemoryWorkoutRepository();
        await workouts.AddAsync(CompletedWorkout(ownerId, DateTime.UtcNow.Date.AddDays(-8)), CancellationToken.None);
        await workouts.AddAsync(CompletedWorkout(ownerId, DateTime.UtcNow.Date.AddDays(-7)), CancellationToken.None);
        await workouts.AddAsync(CompletedWorkout(ownerId, DateTime.UtcNow.Date.AddDays(-5)), CancellationToken.None);
        var service = new ProgressService(workouts, new TestCurrentUser(ownerId));

        var progress = await service.GetProgressAsync(PrScope.All, CancellationToken.None);

        Assert.Equal(0, progress.Streak.Current);
        Assert.Equal(2, progress.Streak.Longest);
    }

    private static Workout CompletedWorkout(Guid ownerId, DateTime completedAt) =>
        new()
        {
            Id = Guid.NewGuid(),
            OwnerUserId = ownerId,
            Title = "Completed workout",
            ScheduledAt = completedAt.AddHours(-1),
            CompletedAt = completedAt,
            Exercises =
            [
                new Exercise
                {
                    Id = Guid.NewGuid(),
                    Name = "Bench Press",
                    Sets = 3,
                    Reps = 8,
                    Weight = 60,
                }
            ],
        };
}
