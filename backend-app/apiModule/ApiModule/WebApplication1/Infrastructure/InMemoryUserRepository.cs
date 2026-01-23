using System.Collections.Concurrent;
using ApiModule.Domain;

namespace ApiModule.Infrastructure
{
    public sealed class InMemoryUserRepository : IUserRepository
    {
        private readonly ConcurrentDictionary<string, AppUser> _db = new(StringComparer.OrdinalIgnoreCase);

        public Task<AppUser?> GetByLoginAsync(string login, CancellationToken ct)
            => Task.FromResult(_db.TryGetValue(login, out var u) ? u : null);
        
        public Task CreateAsync(AppUser user, CancellationToken ct)
        {
            _db[user.Login] = user;
            return Task.CompletedTask;
        }
    }
}
