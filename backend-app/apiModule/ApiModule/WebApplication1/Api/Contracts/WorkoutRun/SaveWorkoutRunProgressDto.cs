namespace ApiModule.Api.Contracts.WorkoutRun;

public sealed class SaveWorkoutRunProgressDto
{
    public int? DurationSec { get; init; }
    public string? Notes { get; init; }
    public List<WorkoutRunEntryInputDto> Entries { get; init; } = [];
}
