using ApiModule.Domain;
using Microsoft.EntityFrameworkCore;

namespace ApiModule.Infrastructure;

public sealed class EfWorkoutRepository(AppDbContext db) : IWorkoutRepository
{
    private readonly AppDbContext _db = db;

    public Task<List<Workout>> GetAllByOwnerAsync(Guid ownerUserId, CancellationToken ct)
    {
        return _db.Workouts
            .Where(w => w.OwnerUserId == ownerUserId)
            .Include(w => w.Exercises)
            .ToListAsync(ct);
    }

    public Task<Workout?> GetByIdForOwnerAsync(Guid id, Guid ownerUserId, CancellationToken ct)
    {
        return _db.Workouts
            .Where(w => w.OwnerUserId == ownerUserId && w.Id == id)
            .Include(w => w.Exercises)
            .FirstOrDefaultAsync(ct);
    }

    public Task<Workout?> GetLastCompletedForOwnerAsync(Guid ownerUserId, CancellationToken ct)
    {
        return _db.Workouts
            .Where(w => w.OwnerUserId == ownerUserId && w.CompletedAt != null)
            .OrderByDescending(w => w.CompletedAt)
            .Include(w => w.Exercises)
            .FirstOrDefaultAsync(ct);
    }

    public async Task AddAsync(Workout workout, CancellationToken ct)
    {
        _db.Workouts.Add(workout);
        await _db.SaveChangesAsync(ct);
    }

    public Task UpdateAsync(Workout workout, CancellationToken ct)
    {
        return _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Workout workout, CancellationToken ct)
    {
        _db.Workouts.Remove(workout);
        await _db.SaveChangesAsync(ct);
    }
}
