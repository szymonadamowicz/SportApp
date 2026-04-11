using ApiModule.Domain;

namespace ApiModule.Application;

public sealed class WorkoutService
{
    private readonly IWorkoutRepository _repo;
    private readonly ICurrentUser _currentUser;

    public WorkoutService(IWorkoutRepository repo, ICurrentUser currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public Task<List<Workout>> GetAllAsync(CancellationToken ct)
        => _repo.GetAllByOwnerAsync(_currentUser.UserId, ct);

    public Task<Workout?> GetLastCompletedAsync(CancellationToken ct)
        => _repo.GetLastCompletedForOwnerAsync(_currentUser.UserId, ct);

    public async Task<Workout> CreateAsync(Workout workout, CancellationToken ct)
    {
        workout.OwnerUserId = _currentUser.UserId;
        await _repo.AddAsync(workout, ct);
        return workout;
    }

    public async Task<Workout?> UpdateStructureAsync(
        Guid workoutId,
        string title,
        List<string> muscleGroups,
        List<Exercise> incoming,
        CancellationToken ct)
    {
        var workout = await _repo.GetByIdForOwnerAsync(workoutId, _currentUser.UserId, ct);
        if (workout is null) return null;

        workout.Title = title;
        workout.MuscleGroups = muscleGroups;

        var existing = workout.Exercises.ToDictionary(e => e.Id);

        for (var index = 0; index < incoming.Count; index++)
        {
            var inc = incoming[index];
            inc.OrderIndex = index;

            if (existing.TryGetValue(inc.Id, out var tracked))
            {
                tracked.OrderIndex = index;
                tracked.Name = inc.Name;
                tracked.Sets = inc.Sets;
                tracked.Reps = inc.Reps;
                tracked.Weight = inc.Weight;
                tracked.RestTimeSec = inc.RestTimeSec;
            }
            else
            {
                workout.Exercises.Add(inc);
            }
        }

        var incomingIds = incoming.Select(e => e.Id).ToHashSet();
        workout.Exercises.RemoveAll(e => !incomingIds.Contains(e.Id));
        workout.Exercises = workout.Exercises
            .OrderBy(e => e.OrderIndex)
            .ToList();

        await _repo.UpdateAsync(workout, ct);
        return workout;
    }

    public async Task<Workout?> UpdatePartialAsync(
        Guid id,
        DateTime? scheduledAt,
        DateTime? completedAt,
        string? perceivedLoad,
        CancellationToken ct)
    {
        var workout = await _repo.GetByIdForOwnerAsync(id, _currentUser.UserId, ct);
        if (workout is null) return null;

        if (scheduledAt.HasValue)
            workout.ScheduledAt = scheduledAt.Value;

        workout.CompletedAt = completedAt;

        workout.PerceivedLoad = perceivedLoad;

        await _repo.UpdateAsync(workout, ct);
        return workout;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var workout = await _repo.GetByIdForOwnerAsync(id, _currentUser.UserId, ct);
        if (workout is null) return false;

        await _repo.DeleteAsync(workout, ct);
        return true;
    }
}
