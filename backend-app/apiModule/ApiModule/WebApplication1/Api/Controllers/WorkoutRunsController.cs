using ApiModule.Api.Contracts.WorkoutRun;
using ApiModule.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiModule.Api.Controllers;

[ApiController]
[Route("api/workout-runs")]
[Authorize]
public sealed class WorkoutRunsController(WorkoutRunService service) : ControllerBase
{
    private readonly WorkoutRunService _service = service;

    [HttpGet("active/{workoutId:guid}")]
    public async Task<ActionResult<WorkoutRunStartDto?>> Active(Guid workoutId, CancellationToken ct)
    {
        var activeRun = await _service.GetActiveAsync(workoutId, ct);
        return Ok(activeRun);
    }

    [HttpPost("start/{workoutId:guid}")]
    public async Task<ActionResult<WorkoutRunStartDto>> Start(Guid workoutId, CancellationToken ct)
    {
        var run = await _service.StartAsync(workoutId, ct);
        if (run is null) return NotFound();

        return Ok(run);
    }

    [HttpPost("{runId:guid}/progress")]
    public async Task<ActionResult<WorkoutRunStartDto>> SaveProgress(
        Guid runId,
        [FromBody] SaveWorkoutRunProgressDto dto,
        CancellationToken ct)
    {
        var run = await _service.SaveProgressAsync(runId, dto, ct);
        if (run is null) return NotFound();

        return Ok(run);
    }

    [HttpPost("{runId:guid}/complete")]
    public async Task<ActionResult<WorkoutRunSummaryDto>> Complete(
        Guid runId,
        [FromBody] CompleteWorkoutRunDto dto,
        CancellationToken ct)
    {
        var summary = await _service.CompleteAsync(runId, dto, ct);
        if (summary is null) return NotFound();

        return Ok(summary);
    }
}
