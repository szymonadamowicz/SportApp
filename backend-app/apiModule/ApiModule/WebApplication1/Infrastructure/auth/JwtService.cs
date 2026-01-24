using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ApiModule.Domain;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ApiModule.Infrastructure.Auth;

public interface IJwtService
{
    string CreateToken(AppUser user);
}

public sealed class JwtService : IJwtService
{
    private readonly JwtOptions _opt;

    public JwtService(IOptions<JwtOptions> opt)
    {
        _opt = opt.Value;

        if (string.IsNullOrWhiteSpace(_opt.Key) || _opt.Key.Length < 32)
            throw new InvalidOperationException("Jwt:Key must be at least 32 characters long.");
    }

    public string CreateToken(AppUser user)
    {
        var now = DateTime.UtcNow;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, user.Login),
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.Key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _opt.Issuer,
            audience: _opt.Audience,
            claims: claims,
            notBefore: now,
            expires: now.AddMinutes(_opt.ExpiresMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
