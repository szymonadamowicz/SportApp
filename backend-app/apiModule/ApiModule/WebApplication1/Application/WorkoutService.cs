using ApiModule.Domain;
using System.Globalization;

namespace ApiModule.Application;

public sealed class WorkoutService(IWorkoutRepository repo, ICurrentUser currentUser)
{
    private readonly IWorkoutRepository _repo = repo;
    private readonly ICurrentUser _currentUser = currentUser;

    public async Task<List<Workout>> GetAllAsync(CancellationToken ct)
    {
        var UserId = _currentUser.UserId;
        Console.WriteLine(UserId);
        var all = await _repo.GetAllAsync(ct);
        return [.. all.Where(w => w.OwnerUserId == UserId)];
    }

    public async Task<Workout?> GetLastCompletedAsync(CancellationToken ct)
    {
        var all = await _repo.GetAllAsync(ct);
        return all
            .Where(w => w.CompletedAt != null)
            .OrderByDescending(w => w.CompletedAt)
            .FirstOrDefault();
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
        var existing = await _repo.GetByIdAsync(id, ct);
        if (existing is null) return false;

        await _repo.DeleteAsync(id, ct);
        return true;
    }

    public async Task<Workout> UpdatePartialAsync(Guid id, UpdateWorkoutCommand cmd, CancellationToken ct)
    {
        var workout = await _repo.GetByIdAsync(id, ct) ?? throw new InvalidOperationException("Workout not found");
        if (cmd.ScheduledAt != null)
            workout.ScheduledAt = ParseIsoUtc(cmd.ScheduledAt);

        if (cmd.CompletedAt != null)
            workout.CompletedAt = ParseIsoUtc(cmd.CompletedAt);

        if (cmd.PerceivedLoad != null)
            workout.PerceivedLoad = cmd.PerceivedLoad;

        await _repo.UpdateAsync(workout, ct);
        return workout;
    }

    public async Task<Workout> UpdateStructureAsync(Guid id, UpdateWorkoutStructureCommand cmd, CancellationToken ct)
    {
        var workout = await _repo.GetByIdAsync(id, ct) ?? throw new InvalidOperationException("Workout not found");
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
