using ApiModule.Api.Contracts.Progress;
using ApiModule.Application;
using ApiModule.Application.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiModule.Api.Controllers;

[ApiController]
[Route("api/progress")]
[Authorize]
public sealed class ProgressController(ProgressService progress) : ControllerBase
{
    private readonly ProgressService _progress = progress;

    [HttpGet]
    public async Task<ActionResult<ProgressDto>> Get(
    [FromQuery] string? prScope,
    CancellationToken ct)
    {
        var scope = prScope?.ToLower() == "week"
            ? PrScope.Week
            : PrScope.All;

        var progress = await _progress.GetProgressAsync(scope, ct);
        return Ok(progress);
    }

}
