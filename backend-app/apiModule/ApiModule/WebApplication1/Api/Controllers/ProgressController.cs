using ApiModule.Application;
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
    public ActionResult<object> Get()
    {
        return Ok(_progress.GetProgress());
    }
}
