using ApiModule.Domain;
using Microsoft.EntityFrameworkCore;

namespace ApiModule.Infrastructure;

public sealed class EfWorkoutRunRepository : IWorkoutRunRepository
{
    private readonly AppDbContext _db;

    public EfWorkoutRunRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(WorkoutRun run, CancellationToken ct)
    {
        _db.Set<WorkoutRun>().Add(run);
        await _db.SaveChangesAsync(ct);
    }

    public Task<WorkoutRun?> GetByIdForOwnerAsync(Guid runId, Guid ownerUserId, CancellationToken ct)
        => _db.Set<WorkoutRun>()
            .Include(r => r.Workout)
            .Include(r => r.Entries)
            .FirstOrDefaultAsync(r => r.Id == runId && r.OwnerUserId == ownerUserId, ct);

    public Task<WorkoutRun?> GetActiveByWorkoutForOwnerAsync(Guid workoutId, Guid ownerUserId, CancellationToken ct)
        => _db.Set<WorkoutRun>()
            .Include(r => r.Workout)
            .Include(r => r.Entries)
            .Where(r =>
                r.WorkoutId == workoutId &&
                r.OwnerUserId == ownerUserId &&
                r.FinishedAt == null)
            .OrderByDescending(r => r.StartedAt)
            .FirstOrDefaultAsync(ct);

    public async Task UpdateAsync(WorkoutRun run, CancellationToken ct)
    {
        await _db.SaveChangesAsync(ct);
    }
}
