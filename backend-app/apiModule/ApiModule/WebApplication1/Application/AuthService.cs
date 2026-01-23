using ApiModule.Domain;
using ApiModule.Infrastructure;

namespace ApiModule.Application
{
    public sealed class AuthService
    {
        private readonly IUserRepository _user;

        public AuthService(IUserRepository user)
        {
            _user = user;
        }

        public async Task<bool> LoginAsync(string login, string passwrod, CancellationToken ct)
        {
            var user = await _user.GetByLoginAsync(login, ct);
            if (user == null) return false;

            return user.PasswordHash == passwrod;
        }

        public async Task<bool> RegisterAsync(string login, string password, CancellationToken ct)
        {
            var exisiting = await _user.GetByLoginAsync(login, ct);
            if (exisiting is not null) return false;

            var user = new AppUser
            {
                Id = Guid.NewGuid(),    
                Login = login.Trim(),
                PasswordHash = password
            };

            await _user.CreateAsync(user, ct);
            return true;
        }
    }
}
