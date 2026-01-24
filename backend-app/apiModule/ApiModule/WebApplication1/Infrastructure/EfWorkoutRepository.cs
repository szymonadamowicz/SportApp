using ApiModule.Domain;
using Microsoft.EntityFrameworkCore;

namespace ApiModule.Infrastructure;

public sealed class EfWorkoutRepository(AppDbContext db) : IWorkoutRepository
{
    private readonly AppDbContext _db = db;

    public async Task<List<Workout>> GetAllAsync(CancellationToken ct)
    {
        return await _db.Workouts
            .Include(w => w.Exercises)
            .ToListAsync(ct);
    }

    public async Task<Workout?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Workouts
            .Include(w => w.Exercises)
            .FirstOrDefaultAsync(w => w.Id == id, ct);
    }

    public async Task AddAsync(Workout workout, CancellationToken ct)
    {
        _db.Workouts.Add(workout);
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Workout workout, CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        var workout = await _db.Workouts.FindAsync([id], ct);
        if (workout == null) return;

        _db.Workouts.Remove(workout);
        await _db.SaveChangesAsync(ct);
    }
}
