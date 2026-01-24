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
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    public async Task<ActionResult<bool>> Login([FromBody] LoginDto dto, CancellationToken ct)
    {
        var ok = await _auth.LoginAsync(dto.Login, dto.Password, ct);
        return Ok(ok);
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
