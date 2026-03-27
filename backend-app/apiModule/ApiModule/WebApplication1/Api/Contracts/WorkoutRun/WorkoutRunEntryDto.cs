namespace ApiModule.Api.Contracts.WorkoutRun;

public sealed class WorkoutRunEntryDto
{
    public int StepIndex { get; init; }
    public Guid ExerciseId { get; init; }
    public string ExerciseName { get; init; } = string.Empty;
    public int SetNumber { get; init; }
    public int ExpectedReps { get; init; }
    public int ActualReps { get; init; }
    public bool MetTarget { get; init; }
    public int ExerciseDurationSec { get; init; }
    public int RestDurationSec { get; init; }
    public DateTime CompletedAt { get; init; }
}
