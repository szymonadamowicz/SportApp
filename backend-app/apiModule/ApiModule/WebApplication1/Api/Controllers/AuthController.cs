using ApiModule.Api.Contracts;
using ApiModule.Application;
using Microsoft.AspNetCore.Mvc;

namespace ApiModule.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(AuthService auth) : ControllerBase
{
    private readonly AuthService _auth = auth;

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthTokenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<bool>> Login([FromBody] LoginDto dto, CancellationToken ct)
    {
        var token = await _auth.LoginAsync(dto.Login, dto.Password, ct);
        if (token is null)
            return Unauthorized();
        
        return Ok(new AuthTokenDto { Token = token });
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    public async Task<ActionResult<bool>> Register([FromBody] RegisterDto dto, CancellationToken ct)
    {
        if (dto.Password != dto.RepeatPassword)
            return Ok(false);

        var ok = await _auth.RegisterAsync(dto.Login, dto.Password, ct);
        return Ok(ok);
    }
}
