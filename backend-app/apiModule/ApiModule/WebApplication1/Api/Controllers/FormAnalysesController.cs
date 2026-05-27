using ApiModule.Api.Contracts.FormAnalysis;
using ApiModule.Application.FormAnalysis;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiModule.Api.Controllers;

[ApiController]
[Route("api/form-analyses")]
[Authorize]
public sealed class FormAnalysesController(FormAnalysisService service) : ControllerBase
{
    private readonly FormAnalysisService _service = service;

    [HttpPost]
    [RequestSizeLimit(250L * 1024L * 1024L)]
    public async Task<ActionResult<FormAnalysisResultDto>> Analyze(
        [FromForm] FormAnalysisUploadRequest request,
        CancellationToken ct)
    {
        try
        {
            var result = await _service.AnalyzeAsync(request, ct);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<FormAnalysisResultDto>>> List(
        [FromQuery] Guid? workoutRunId,
        [FromQuery] Guid? workoutId,
        CancellationToken ct)
    {
        var analyses = await _service.ListAsync(workoutRunId, workoutId, ct);
        return Ok(analyses);
    }

    [HttpGet("{analysisId:guid}")]
    public async Task<ActionResult<FormAnalysisResultDto>> Get(
        Guid analysisId,
        CancellationToken ct)
    {
        var analysis = await _service.GetAsync(analysisId, ct);
        if (analysis is null) return NotFound();

        return Ok(analysis);
    }

    [HttpGet("{analysisId:guid}/video")]
    public async Task<IActionResult> Video(
        Guid analysisId,
        [FromQuery] string? kind,
        CancellationToken ct)
    {
        var file = await _service.GetVideoAsync(analysisId, kind, ct);
        if (file is null) return NotFound();

        return PhysicalFile(
            file.Path,
            file.ContentType,
            enableRangeProcessing: true);
    }
}
