namespace ApiModule.Domain;

public interface IWorkoutRepository
{
    Task<List<Workout>> GetAllByOwnerAsync(Guid ownerUserId, CancellationToken ct);
    Task<Workout?> GetByIdForOwnerAsync(Guid id, Guid ownerUserId, CancellationToken ct);
    Task<Workout?> GetLastCompletedForOwnerAsync(Guid ownerUserId, CancellationToken ct);

    Task AddAsync(Workout workout, CancellationToken ct);
    Task UpdateAsync(Workout workout, CancellationToken ct);
    Task DeleteAsync(Workout workout, CancellationToken ct);
}
