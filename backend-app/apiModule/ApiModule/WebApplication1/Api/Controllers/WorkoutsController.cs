using ApiModule.Api.Contracts.Workout;
using ApiModule.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiModule.Api.Controllers;

[ApiController]
[Route("api/workouts")]
[Authorize]
public sealed class WorkoutsController(WorkoutService service) : ControllerBase
{
    private readonly WorkoutService _service = service;

    [HttpGet]
    [ProducesResponseType(typeof(List<WorkoutDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<WorkoutDto>>> GetAll(CancellationToken ct)
    {
        var items = await _service.GetAllAsync(ct);
        return Ok(items.Select(WorkoutMapper.ToDto).ToList());
    }

    [HttpGet("lastCompleted")]
    [ProducesResponseType(typeof(WorkoutDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<WorkoutDto?>> GetLastCompleted(CancellationToken ct)
    {
        var item = await _service.GetLastCompletedAsync(ct);
        if (item is null) return Ok(null);

        return Ok(WorkoutMapper.ToDto(item));
    }

    [HttpPost]
    [ProducesResponseType(typeof(WorkoutDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<WorkoutDto>> Create(
        [FromBody] CreateWorkoutDto dto,
        CancellationToken ct)
    {
        var domain = WorkoutMapper.ToDomain(dto);
        var created = await _service.CreateAsync(domain, ct);

        return Ok(WorkoutMapper.ToDto(created));
    }

    [HttpPatch("{id:guid}")]
    [ProducesResponseType(typeof(WorkoutDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkoutDto>> Patch(
        [FromRoute] Guid id,
        [FromBody] UpdateWorkoutDto dto,
        CancellationToken ct)
    {
        var updated = await _service.UpdatePartialAsync(
            id,
            dto.ScheduledAt is null ? null : DateTime.Parse(dto.ScheduledAt),
            dto.CompletedAt is null ? null : DateTime.Parse(dto.CompletedAt),
            dto.PerceivedLoad,
            ct);

        if (updated is null)
            return NotFound();

        return Ok(WorkoutMapper.ToDto(updated));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(WorkoutDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkoutDto>> Put(
        [FromRoute] Guid id,
        [FromBody] UpdateWorkoutStructureDto dto,
        CancellationToken ct)
    {
        var exercises = dto.Exercises
            .Select(WorkoutMapper.ToDomain)
            .ToList();

        var updated = await _service.UpdateStructureAsync(
            id,
            exercises,
            dto.Title,
            ct);

        if (updated is null)
            return NotFound();

        return Ok(WorkoutMapper.ToDto(updated));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(bool), StatusCodes.Status200OK)]
    public async Task<ActionResult<bool>> Delete(
        [FromRoute] Guid id,
        CancellationToken ct)
    {
        var ok = await _service.DeleteAsync(id, ct);
        return Ok(ok);
    }
}
