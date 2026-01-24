using ApiModule.Domain;
using System.Globalization;

namespace ApiModule.Application;

public sealed class WorkoutService(IWorkoutRepository repo, ICurrentUser currentUser)
{
    private readonly IWorkoutRepository _repo = repo;
    private readonly ICurrentUser _currentUser = currentUser;

    public Task<List<Workout>> GetAllAsync(CancellationToken ct)
    {
        return _repo.GetAllByOwnerAsync(_currentUser.UserId, ct);
    }

    public Task<Workout?> GetLastCompletedAsync(CancellationToken ct)
    {
        return _repo.GetLastCompletedForOwnerAsync(_currentUser.UserId, ct);
    }

    public async Task<Workout> CreateAsync(Workout workout, CancellationToken ct)
    {
        workout.SetOwner(_currentUser.UserId);

        workout.Title = (workout.Title ?? "").Trim();
        if (string.IsNullOrWhiteSpace(workout.Title))
            workout.Title = "Untitled workout";

        workout.ScheduledAt = NormalizeUtc(workout.ScheduledAt);
        if (workout.CompletedAt != null)
            workout.CompletedAt = NormalizeUtc(workout.CompletedAt.Value);

        await _repo.AddAsync(workout, ct);
        return workout;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var workout = await _repo.GetByIdForOwnerAsync(id, _currentUser.UserId, ct);
        if (workout is null) return false;

        await _repo.DeleteAsync(workout, ct);
        return true;
    }

    public async Task<Workout?> UpdatePartialAsync(Guid id, UpdateWorkoutCommand cmd, CancellationToken ct)
    {
        var workout = await _repo.GetByIdForOwnerAsync(id, _currentUser.UserId, ct);
        if (workout is null) return null;

        if (cmd.ScheduledAt != null)
            workout.ScheduledAt = ParseIsoUtc(cmd.ScheduledAt);

        if (cmd.CompletedAt != null)
            workout.CompletedAt = ParseIsoUtc(cmd.CompletedAt);

        if (cmd.PerceivedLoad != null)
            workout.PerceivedLoad = cmd.PerceivedLoad;

        await _repo.UpdateAsync(workout, ct);
        return workout;
    }

    public async Task<Workout?> UpdateStructureAsync(Guid id, UpdateWorkoutStructureCommand cmd, CancellationToken ct)
    {
        var workout = await _repo.GetByIdForOwnerAsync(id, _currentUser.UserId, ct);
        if (workout is null) return null;

        workout.Title = (cmd.Title ?? "").Trim();
        if (string.IsNullOrWhiteSpace(workout.Title))
            workout.Title = "Untitled workout";

        ApplyExerciseUpdate(workout, cmd.Exercises);

        await _repo.UpdateAsync(workout, ct);
        return workout;
    }

    private static void ApplyExerciseUpdate(Workout workout, List<Exercise> incoming)
    {
        incoming ??= [];

        var existingById = workout.Exercises.ToDictionary(e => e.Id, e => e);

        var newList = new List<Exercise>();

        foreach (var ex in incoming)
        {
            if (ex.Id == Guid.Empty)
                ex.Id = Guid.NewGuid();

            if (existingById.TryGetValue(ex.Id, out var existing))
            {
                existing.Name = ex.Name;
                existing.Sets = ex.Sets;
                existing.Reps = ex.Reps;
                existing.Weight = ex.Weight;
                existing.RestTimeSec = ex.RestTimeSec;

                newList.Add(existing);
            }
            else
            {
                newList.Add(ex);
            }
        }

        workout.Exercises = newList;
    }

    private static DateTime ParseIsoUtc(string value)
    {
        var dt = DateTime.Parse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
        return NormalizeUtc(dt);
    }

    private static DateTime NormalizeUtc(DateTime dt)
    {
        return dt.Kind switch
        {
            DateTimeKind.Utc => dt,
            DateTimeKind.Local => dt.ToUniversalTime(),
            DateTimeKind.Unspecified => DateTime.SpecifyKind(dt, DateTimeKind.Utc),
            _ => DateTime.SpecifyKind(dt, DateTimeKind.Utc)
        };
    }
}
