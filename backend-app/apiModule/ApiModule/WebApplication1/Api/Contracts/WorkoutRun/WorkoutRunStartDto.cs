namespace ApiModule.Api.Contracts.WorkoutRun;

public sealed class WorkoutRunStartDto
{
    public Guid RunId { get; init; }
    public Guid WorkoutId { get; init; }
    public string WorkoutTitle { get; init; } = string.Empty;
    public DateTime StartedAt { get; init; }
    public bool IsResumed { get; init; }
    public int NextStepIndex { get; init; }
    public string ActivePhase { get; init; } = "exercise";
    public int CurrentStepIndex { get; init; }
    public int? RemainingSeconds { get; init; }
    public int? PhaseDurationSec { get; init; }
    public bool IsPaused { get; init; }
    public DateTime? LastProgressAt { get; init; }
    public int? DurationSec { get; init; }
    public string? Notes { get; init; }
    public List<WorkoutRunEntryDto> Entries { get; init; } = [];
    public List<WorkoutRunStepDto> Steps { get; init; } = [];
}
