using System.Collections.Concurrent;
using ApiModule.Domain;

namespace ApiModule.Infrastructure;

public sealed class InMemoryWorkoutRepository: IWorkoutRepository
{
    private readonly ConcurrentDictionary<Guid, Workout> _db = new();

    public Task<List<Workout>> GetAllAsync(CancellationToken ct)
        => Task.FromResult(_db.Values.OrderBy(w => w.ScheduledAt).ToList());

    public Task<Workout?> GetByIdAsync(Guid id, CancellationToken ct)
        => Task.FromResult(_db.TryGetValue(id, out var w) ? w : null);

    public Task AddAsync(Workout workout, CancellationToken ct)
    {
        _db[workout.Id] = workout;
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Workout workout, CancellationToken ct)
    {
        _db[workout.Id] = workout;
        return Task.CompletedTask;
    }
    
    public Task DeleteAsync(Guid id, CancellationToken ct)
    {
        _db.TryRemove(id, out _);
        return Task.CompletedTask;
    }
}
