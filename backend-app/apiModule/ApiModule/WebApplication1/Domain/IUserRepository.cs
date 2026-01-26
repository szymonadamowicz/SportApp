namespace ApiModule.Domain;

public interface IUserRepository
{
    Task<AppUser?> GetByLoginAsync(string login, CancellationToken ct);
    Task<AppUser?> GetByIdAsync(Guid id, CancellationToken ct);
    Task CreateAsync(AppUser user, CancellationToken ct);
    Task SaveAsync(CancellationToken ct);
}
