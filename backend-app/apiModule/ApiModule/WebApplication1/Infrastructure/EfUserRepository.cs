using ApiModule.Domain;
using Microsoft.EntityFrameworkCore;

namespace ApiModule.Infrastructure;

public sealed class EfUserRepository(AppDbContext db) : IUserRepository
{
    private readonly AppDbContext _db = db;

    public async Task<AppUser?> GetByLoginAsync(string login, CancellationToken ct)
    {
        var normalized = (login ?? "").Trim();
        if (string.IsNullOrWhiteSpace(normalized)) return null;

        return await _db.Users
            .FirstOrDefaultAsync(u => u.Login == normalized, ct);
    }

    public async Task CreateAsync(AppUser user, CancellationToken ct)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);
    }
}
