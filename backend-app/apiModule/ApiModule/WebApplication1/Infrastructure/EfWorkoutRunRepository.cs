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
                .ThenInclude(w => w.Exercises)
            .Include(r => r.Entries)
            .FirstOrDefaultAsync(r => r.Id == runId && r.OwnerUserId == ownerUserId, ct);

    public Task<WorkoutRun?> GetActiveByWorkoutForOwnerAsync(Guid workoutId, Guid ownerUserId, CancellationToken ct)
        => _db.Set<WorkoutRun>()
            .Include(r => r.Workout)
                .ThenInclude(w => w.Exercises)
            .Include(r => r.Entries)
            .Where(r =>
                r.WorkoutId == workoutId &&
                r.OwnerUserId == ownerUserId &&
                r.FinishedAt == null)
            .OrderByDescending(r => r.StartedAt)
            .FirstOrDefaultAsync(ct);

    public Task<WorkoutRun?> GetLatestActiveForOwnerAsync(Guid ownerUserId, CancellationToken ct)
        => _db.Set<WorkoutRun>()
            .Include(r => r.Workout)
                .ThenInclude(w => w.Exercises)
            .Include(r => r.Entries)
            .Where(r => r.OwnerUserId == ownerUserId && r.FinishedAt == null)
            .OrderByDescending(r => r.LastProgressAt ?? r.StartedAt)
            .FirstOrDefaultAsync(ct);

    public async Task UpdateAsync(WorkoutRun run, CancellationToken ct)
    {
        await MarkMissingRunEntriesAsAddedAsync(ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task ReplaceEntriesAndUpdateAsync(
        WorkoutRun run,
        IReadOnlyCollection<WorkoutRunEntry> entries,
        CancellationToken ct)
    {
        var trackedEntries = _db.ChangeTracker
            .Entries<WorkoutRunEntry>()
            .Where(entry => entry.Entity.WorkoutRunId == run.Id)
            .ToList();

        foreach (var trackedEntry in trackedEntries)
        {
            trackedEntry.State = EntityState.Detached;
        }

        await _db.Set<WorkoutRunEntry>()
            .Where(entry => entry.WorkoutRunId == run.Id)
            .ExecuteDeleteAsync(ct);

        if (entries.Count > 0)
        {
            _db.Set<WorkoutRunEntry>().AddRange(entries);
        }

        await _db.SaveChangesAsync(ct);
    }

    private async Task MarkMissingRunEntriesAsAddedAsync(CancellationToken ct)
    {
        var modifiedEntries = _db.ChangeTracker
            .Entries<WorkoutRunEntry>()
            .Where(entry => entry.State == EntityState.Modified)
            .ToList();

        foreach (var entry in modifiedEntries)
        {
            var exists = await _db.WorkoutRunEntries
                .AsNoTracking()
                .AnyAsync(item => item.Id == entry.Entity.Id, ct);

            if (!exists)
            {
                entry.State = EntityState.Added;
            }
        }
    }
}
