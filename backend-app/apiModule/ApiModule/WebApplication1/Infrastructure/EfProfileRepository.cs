using ApiModule.Domain;
using Microsoft.EntityFrameworkCore;

namespace ApiModule.Infrastructure;

public sealed class EfProfileRepository(AppDbContext db) : IProfileRepository
{
    private readonly AppDbContext _db = db;

    public Task<Profile?> GetByOwnerIdAsync(Guid ownerId, CancellationToken ct)
    {
        return _db.Profiles.FirstOrDefaultAsync(p => p.OwnerId == ownerId, ct);
    }

    public async Task UpsertAsync(Profile profile, CancellationToken ct)
    {
        var existing = await _db.Profiles
            .FirstOrDefaultAsync(p => p.OwnerId == profile.OwnerId, ct);

        if (existing is null)
        {
            _db.Profiles.Add(profile);
        }
        else
        {
            existing.Name = profile.Name;
            existing.Email = profile.Email;
            existing.BirthDate = profile.BirthDate;
        }

        await _db.SaveChangesAsync(ct);
    }
}
