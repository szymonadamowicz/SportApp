using ApiModule.Api.Contracts.Profile;
using ApiModule.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace ApiModule.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public sealed class ProfileController(ProfileService service) : ControllerBase
{
    private readonly ProfileService _service = service;

    [HttpGet]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ProfileDto>> Get(CancellationToken ct)
    {
        var profile = await _service.GetMyProfileAsync(ct);
        return Ok(ProfileMapper.ToDto(profile));
    }

    [HttpPatch("update-profile")]
    public async Task<ActionResult<ProfileDto>> UpdateProfile(
        [FromBody] UpdateProfileDto dto,
        CancellationToken ct)
    {
        DateOnly? birthDate = null;

        if (!string.IsNullOrWhiteSpace(dto.BirthDate))
        {
            if (!DateOnly.TryParseExact(
                dto.BirthDate,
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var parsed))
            {
                return BadRequest("Invalid birthDate format. Expected yyyy-MM-dd");
            }

            birthDate = parsed;
        }

        var updated = await _service.UpdateMyProfileAsync(
            dto.Name,
            dto.Email,
            birthDate,
            ct
        );

        return Ok(ProfileMapper.ToDto(updated));
    }

    [HttpPost("change-password")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    public async Task<ActionResult<bool>> ChangePassword(
        [FromBody] ChangePasswordDto dto,
        CancellationToken ct)
    {
        var ok = await _service.ChangePasswordAsync(
            dto.CurrentPassword,
            dto.NewPassword,
            ct);

        return Ok(ok);
    }
}
