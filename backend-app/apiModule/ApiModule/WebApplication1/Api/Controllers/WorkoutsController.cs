using ApiModule.Api.Contracts.Workout;
using ApiModule.Application;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiModule.Api.Controllers;

[ApiController]
[Route("api/workouts")]
[Authorize]
public sealed class WorkoutsController : ControllerBase
{
    private readonly WorkoutService _service;

    public WorkoutsController(WorkoutService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<WorkoutDto>>> GetAll(CancellationToken ct)
    {
        var items = await _service.GetAllAsync(ct);
        return Ok(items.Select(WorkoutMapper.ToDto).ToList());
    }

    [HttpGet("lastCompleted")]
    public async Task<ActionResult<WorkoutDto?>> GetLastCompleted(CancellationToken ct)
    {
        var item = await _service.GetLastCompletedAsync(ct);
        if (item is null) return Ok(null);
        return Ok(WorkoutMapper.ToDto(item));
    }

    [HttpPost]
    public async Task<ActionResult<WorkoutDto>> Create(CreateWorkoutDto dto, CancellationToken ct)
    {
        var workout = WorkoutMapper.ToDomain(dto);
        var created = await _service.CreateAsync(workout, ct);
        return Ok(WorkoutMapper.ToDto(created));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<WorkoutDto>> Put(Guid id, UpdateWorkoutStructureDto dto, CancellationToken ct)
    {
        var exercises = dto.Exercises
            .Select(WorkoutMapper.ToDomain)
            .ToList();

        var updated = await _service.UpdateStructureAsync(
            id,
            dto.Title ?? string.Empty,
            exercises,
            ct);

        if (updated is null) return NotFound();
        return Ok(WorkoutMapper.ToDto(updated));
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<WorkoutDto>> Patch(Guid id, [FromBody] UpdateWorkoutDto dto, CancellationToken ct)
    {
        var updated = await _service.UpdatePartialAsync(id, dto.ScheduledAt, dto.CompletedAt, dto.PerceivedLoad, ct);
        if (updated is null) return NotFound();
        return Ok(WorkoutMapper.ToDto(updated));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<bool>> Delete(Guid id, CancellationToken ct)
    {
        var ok = await _service.DeleteAsync(id, ct);
        return Ok(ok);
    }
}
