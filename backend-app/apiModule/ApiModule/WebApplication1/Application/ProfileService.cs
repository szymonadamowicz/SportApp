using ApiModule.Domain;
using Microsoft.AspNetCore.Identity;

namespace ApiModule.Application;

public sealed class ProfileService(
    IProfileRepository repo,
    IUserRepository users,
    IPasswordHasher<AppUser> hasher,
    ICurrentUser currentUser)
{
    private readonly IProfileRepository _repo = repo;
    private readonly IUserRepository _users = users;
    private readonly IPasswordHasher<AppUser> _hasher = hasher;
    private readonly ICurrentUser _currentUser = currentUser;

    public async Task<Profile> GetMyProfileAsync(CancellationToken ct)
    {
        var ownerId = _currentUser.UserId;

        var profile = await _repo.GetByOwnerIdAsync(ownerId, ct);
        if (profile is not null)
            return profile;

        var created = new Profile
        {
            OwnerId = ownerId
        };

        await _repo.UpsertAsync(created, ct);
        return created;
    }

    public async Task<Profile> UpdateMyProfileAsync(
        string? name,
        string? email,
        DateOnly? birthDate,
        CancellationToken ct)
    {
        var ownerId = _currentUser.UserId;

        var profile = await _repo.GetByOwnerIdAsync(ownerId, ct)
                      ?? new Profile { OwnerId = ownerId };

        if (name is not null)
            profile.Name = name.Trim();

        if (email is not null)
            profile.Email = email.Trim();

        if (birthDate is not null)
            profile.BirthDate = birthDate;

        await _repo.UpsertAsync(profile, ct);
        return profile;
    }

    public async Task<bool> ChangePasswordAsync(
        string currentPassword,
        string newPassword,
        CancellationToken ct)
    {
        var user = await _users.GetByIdAsync(_currentUser.UserId, ct);
        if (user is null)
            return false;

        var verifyResult = _hasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            currentPassword);

        if (verifyResult == PasswordVerificationResult.Failed)
            return false;

        var newHash = _hasher.HashPassword(user, newPassword);
        user.SetPasswordHash(newHash);

        await _users.SaveAsync(ct);
        return true;
    }
}
