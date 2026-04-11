namespace ApiModule.Api.Contracts.WorkoutRun;

public sealed class CompleteWorkoutRunDto
{
    public int? DurationSec { get; init; }
    public string? Notes { get; init; }
    public List<WorkoutRunEntryInputDto> Entries { get; init; } = [];
}
