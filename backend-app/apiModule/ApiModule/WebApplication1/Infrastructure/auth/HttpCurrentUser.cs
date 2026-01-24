using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ApiModule.Domain;

namespace ApiModule.Infrastructure.Auth;

public sealed class HttpCurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    private readonly IHttpContextAccessor _accessor = accessor;

    public Guid UserId
    {
        get
        {
            var user = _accessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true)
                throw new UnauthorizedAccessException("Not authenticated.");

            var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                      ?? user.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(sub, out var id))
                throw new UnauthorizedAccessException("Invalid token (sub).");

            return id;
        }
    }

    public string Login
    {
        get
        {
            var user = _accessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true)
                throw new UnauthorizedAccessException("Not authenticated.");

            return user.Identity?.Name
                ?? user.FindFirstValue(JwtRegisteredClaimNames.UniqueName)
                ?? "";
        }
    }
}
