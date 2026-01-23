using ApiModule.Application;
using Microsoft.AspNetCore.Mvc;

namespace ApiModule.Api.Controllers;

[ApiController]
[Route("progress")]
public sealed class ProgressController : ControllerBase
{
    private readonly ProgressService _progress;

    public ProgressController(ProgressService progress)
    {
        _progress = progress;
    }

    [HttpGet]
    public ActionResult<object> Get()
    {
        return Ok(_progress.GetProgress());
    }
}
