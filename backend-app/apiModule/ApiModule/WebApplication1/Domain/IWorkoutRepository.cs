namespace ApiModule.Domain;

public interface IWorkoutRepository
{
    Task<List<Workout>> GetAllAsync(CancellationToken ct);
    Task<Workout?> GetByIdAsync(Guid id, CancellationToken ct);
    Task AddAsync(Workout workout, CancellationToken ct);
    Task UpdateAsync(Workout workout, CancellationToken ct);
    Task DeleteAsync(Guid id, CancellationToken ct);
}
