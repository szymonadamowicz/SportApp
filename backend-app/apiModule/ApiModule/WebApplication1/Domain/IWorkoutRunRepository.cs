namespace ApiModule.Domain;

public interface IWorkoutRunRepository
{
    Task AddAsync(WorkoutRun run, CancellationToken ct);
    Task<WorkoutRun?> GetByIdForOwnerAsync(Guid runId, Guid ownerUserId, CancellationToken ct);
    Task<WorkoutRun?> GetActiveByWorkoutForOwnerAsync(Guid workoutId, Guid ownerUserId, CancellationToken ct);
    Task UpdateAsync(WorkoutRun run, CancellationToken ct);
}
