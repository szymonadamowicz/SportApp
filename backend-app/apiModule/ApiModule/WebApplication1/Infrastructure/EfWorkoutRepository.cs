using ApiModule.Domain;
using Microsoft.EntityFrameworkCore;

namespace ApiModule.Infrastructure;

public sealed class EfWorkoutRepository : IWorkoutRepository
{
    private readonly AppDbContext _db;

    public EfWorkoutRepository(AppDbContext db)
    {
        _db = db;
    }

    public Task<List<Workout>> GetAllByOwnerAsync(Guid ownerUserId, CancellationToken ct)
        => _db.Workouts
            .AsNoTracking()
            .AsSplitQuery()
            .Where(w => w.OwnerUserId == ownerUserId)
            .Include(w => w.Exercises.OrderBy(e => e.OrderIndex))
            .ToListAsync(ct);

    public Task<Workout?> GetByIdForOwnerAsync(Guid id, Guid ownerUserId, CancellationToken ct)
        => _db.Workouts
            .Include(w => w.Exercises.OrderBy(e => e.OrderIndex))
            .FirstOrDefaultAsync(w => w.Id == id && w.OwnerUserId == ownerUserId, ct);

    public Task<Workout?> GetLastCompletedForOwnerAsync(Guid ownerUserId, CancellationToken ct)
        => _db.Workouts
            .AsNoTracking()
            .AsSplitQuery()
            .Where(w => w.OwnerUserId == ownerUserId && w.CompletedAt != null)
            .OrderByDescending(w => w.CompletedAt)
            .Include(w => w.Exercises.OrderBy(e => e.OrderIndex))
            .FirstOrDefaultAsync(ct);

    public async Task AddAsync(Workout workout, CancellationToken ct)
    {
        _db.Workouts.Add(workout);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Workout workout, CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Workout workout, CancellationToken ct)
    {
        _db.Workouts.Remove(workout);
        await _db.SaveChangesAsync(ct);
    }
}
