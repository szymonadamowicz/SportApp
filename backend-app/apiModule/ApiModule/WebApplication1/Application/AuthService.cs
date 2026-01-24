using ApiModule.Domain;
using Microsoft.AspNetCore.Identity;

namespace ApiModule.Application;

public sealed class AuthService(IUserRepository users, IPasswordHasher<AppUser> hasher)
{
    private readonly IUserRepository _users = users;
    private readonly IPasswordHasher<AppUser> _hasher = hasher;

    public async Task<bool> LoginAsync(string login, string password, CancellationToken ct)
    {
        var user = await _users.GetByLoginAsync(login, ct);
        if (user == null) return false;

        var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        return result == PasswordVerificationResult.Success;
    }

    public async Task<bool> RegisterAsync(string login, string password, CancellationToken ct)
    {
        var normalized = (login ?? "").Trim();
        if (string.IsNullOrWhiteSpace(normalized)) return false;

        if (string.IsNullOrWhiteSpace(password)) return false;

        var existing = await _users.GetByLoginAsync(normalized, ct);
        if (existing is not null) return false;

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Login = normalized,
        };

        user.PasswordHash = _hasher.HashPassword(user, password);

        await _users.CreateAsync(user, ct);
        return true;
    }
}
