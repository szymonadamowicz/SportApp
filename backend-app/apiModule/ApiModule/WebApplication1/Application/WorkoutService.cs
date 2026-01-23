using ApiModule.Domain;
using ApiModule.Infrastructure;
using System.Globalization;

namespace ApiModule.Application;

public sealed class WorkoutService
{
    private readonly IWorkoutRepository _repo;

    public WorkoutService(IWorkoutRepository repo)
    {
        _repo = repo;
    }

    public Task<List<Workout>> GetAllAsync(CancellationToken ct)
        => _repo.GetAllAsync(ct);

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
        workout.Title = (workout.Title ?? "").Trim();

        if (string.IsNullOrEmpty(workout.Title))
        {
            workout.Title = "Untitled workout";
        }
        await _repo.AddAsync(workout, ct);
        return workout;
    }

    public async Task<Workout> UpdateAsync(Workout workout, CancellationToken ct)
    {
        var existing = await _repo.GetByIdAsync(workout.Id, ct);
        if (existing is null)
        {
            throw new InvalidOperationException("Workout not found");
        }
        await _repo.UpdateAsync(workout, ct);
        return workout;
    }
    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var existing = await _repo.GetByIdAsync(id, ct);
        if (existing is null)
            return false;

        await _repo.DeleteAsync(id, ct);
        return true;
    }

    public async Task<Workout> UpdatePartialAsync(
     Guid id,
     UpdateWorkoutCommand cmd,
     CancellationToken ct)
    {
        var workout = await _repo.GetByIdAsync(id, ct);
        if (workout == null)
            throw new InvalidOperationException("Workout not found");

        if (cmd.ScheduledAt != null)
            workout.ScheduledAt = ParseIso(cmd.ScheduledAt);

        if (cmd.CompletedAt != null)
            workout.CompletedAt = ParseIso(cmd.CompletedAt);

        if (cmd.PerceivedLoad != null)
            workout.PerceivedLoad = cmd.PerceivedLoad;

        await _repo.UpdateAsync(workout, ct);
        return workout;
    }

    public async Task<Workout> UpdateStructureAsync(
           Guid id,
           UpdateWorkoutStructureCommand cmd,
           CancellationToken ct)
    {
        var workout = await _repo.GetByIdAsync(id, ct);
        if (workout == null)
            throw new InvalidOperationException("Workout not found");

        workout.Title = cmd.Title.Trim();
        workout.Exercises = cmd.Exercises;

        await _repo.UpdateAsync(workout, ct);
        return workout;
    }


    private static DateTime ParseIso(string value)
        => DateTime.Parse(
            value,
            CultureInfo.InvariantCulture,
            DateTimeStyles.RoundtripKind
        );
}