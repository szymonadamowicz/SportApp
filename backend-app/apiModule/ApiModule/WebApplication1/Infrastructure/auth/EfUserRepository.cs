using ApiModule.Domain;
using Microsoft.EntityFrameworkCore;

namespace ApiModule.Infrastructure.Auth;

public sealed class EfUserRepository(AppDbContext db) : IUserRepository
{
    private readonly AppDbContext _db = db;

    public Task<AppUser?> GetByLoginAsync(string login, CancellationToken ct)
    {
        return _db.Users.FirstOrDefaultAsync(u => u.Login == login, ct);
    }

    public Task<AppUser?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
    }

    public async Task CreateAsync(AppUser user, CancellationToken ct)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);
    }

    public Task SaveAsync(CancellationToken ct)
    {
        return _db.SaveChangesAsync(ct);
    }
}
