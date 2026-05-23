namespace ApiModule.Api.Contracts.WorkoutRun;

public sealed class SaveWorkoutRunProgressDto
{
    public int? DurationSec { get; init; }
    public string? Notes { get; init; }
    public string? ActivePhase { get; init; }
    public int? CurrentStepIndex { get; init; }
    public int? RemainingSeconds { get; init; }
    public int? PhaseDurationSec { get; init; }
    public bool? IsPaused { get; init; }
    public List<WorkoutRunEntryInputDto> Entries { get; init; } = [];
}
