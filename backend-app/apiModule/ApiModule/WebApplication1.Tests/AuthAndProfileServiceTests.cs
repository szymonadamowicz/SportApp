using ApiModule.Application;
using ApiModule.Domain;
using Microsoft.AspNetCore.Identity;

namespace ApiModule.Tests;

public sealed class AuthAndProfileServiceTests
{
    [Fact]
    public async Task RegisterAsync_TrimsLoginHashesPasswordAndPreventsDuplicates()
    {
        var users = new InMemoryUserRepository();
        var hasher = new PasswordHasher<AppUser>();
        var service = new AuthService(users, hasher, new TestJwtService());

        var created = await service.RegisterAsync("  lifter  ", "secret123", CancellationToken.None);
        var duplicate = await service.RegisterAsync("lifter", "other-secret", CancellationToken.None);

        Assert.True(created);
        Assert.False(duplicate);
        var user = Assert.Single(users.Users);
        Assert.Equal("lifter", user.Login);
        Assert.NotEqual("secret123", user.PasswordHash);
        Assert.NotEmpty(user.PasswordHash);
    }

    [Fact]
    public async Task LoginAsync_ReturnsTokenOnlyForValidPassword()
    {
        var users = new InMemoryUserRepository();
        var hasher = new PasswordHasher<AppUser>();
        var service = new AuthService(users, hasher, new TestJwtService());
        await service.RegisterAsync("lifter", "secret123", CancellationToken.None);

        var invalid = await service.LoginAsync("lifter", "wrong", CancellationToken.None);
        var valid = await service.LoginAsync("lifter", "secret123", CancellationToken.None);

        Assert.Null(invalid);
        Assert.StartsWith("token:", valid);
        Assert.Contains(":lifter", valid);
    }

    [Fact]
    public async Task GetMyProfileAsync_CreatesDefaultProfileWhenMissing()
    {
        var ownerId = Guid.NewGuid();
        var profiles = new InMemoryProfileRepository();
        var service = CreateProfileService(ownerId, profiles);

        var profile = await service.GetMyProfileAsync(CancellationToken.None);

        Assert.Equal(ownerId, profile.OwnerId);
        Assert.Null(profile.Name);
        Assert.Equal(1, profiles.UpsertCalls);
    }

    [Fact]
    public async Task UpdateMyProfileAsync_TrimsProvidedFieldsAndKeepsBirthDate()
    {
        var ownerId = Guid.NewGuid();
        var profiles = new InMemoryProfileRepository();
        var service = CreateProfileService(ownerId, profiles);
        var birthDate = new DateOnly(2000, 1, 2);

        var profile = await service.UpdateMyProfileAsync(
            "  Ada  ",
            "  ada@example.com  ",
            birthDate,
            CancellationToken.None);

        Assert.Equal("Ada", profile.Name);
        Assert.Equal("ada@example.com", profile.Email);
        Assert.Equal(birthDate, profile.BirthDate);
        Assert.Equal(1, profiles.UpsertCalls);
    }

    [Fact]
    public async Task ChangePasswordAsync_VerifiesCurrentPasswordBeforeSaving()
    {
        var ownerId = Guid.NewGuid();
        var users = new InMemoryUserRepository();
        var hasher = new PasswordHasher<AppUser>();
        var user = new AppUser { Id = ownerId, Login = "lifter" };
        user.SetPasswordHash(hasher.HashPassword(user, "old-password"));
        users.Add(user);
        var service = CreateProfileService(ownerId, new InMemoryProfileRepository(), users, hasher);

        var wrongPassword = await service.ChangePasswordAsync(
            "bad-password",
            "new-password",
            CancellationToken.None);
        var changed = await service.ChangePasswordAsync(
            "old-password",
            "new-password",
            CancellationToken.None);
        var verifyNew = hasher.VerifyHashedPassword(user, user.PasswordHash, "new-password");

        Assert.False(wrongPassword);
        Assert.True(changed);
        Assert.Equal(PasswordVerificationResult.Success, verifyNew);
        Assert.Equal(1, users.SaveCalls);
    }

    private static ProfileService CreateProfileService(
        Guid ownerId,
        InMemoryProfileRepository profiles,
        InMemoryUserRepository? users = null,
        IPasswordHasher<AppUser>? hasher = null)
    {
        return new ProfileService(
            profiles,
            users ?? new InMemoryUserRepository(),
            hasher ?? new PasswordHasher<AppUser>(),
            new TestCurrentUser(ownerId));
    }
}
