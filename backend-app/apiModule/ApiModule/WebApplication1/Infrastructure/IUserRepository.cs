using ApiModule.Domain;

namespace ApiModule.Infrastructure
{
    public interface IUserRepository
    {
        Task<AppUser?> GetByLoginAsync(string login, CancellationToken ct);
        Task CreateAsync(AppUser user, CancellationToken ct);
    }
}
