namespace ApiModule.Api.Contracts.WorkoutRun;

public sealed class WorkoutRunStepDto
{
    public int StepIndex { get; init; }
    public Guid ExerciseId { get; init; }
    public string ExerciseName { get; init; } = string.Empty;
    public int SetNumber { get; init; }
    public int TotalSets { get; init; }
    public int ExpectedReps { get; init; }
    public decimal? ExpectedWeight { get; init; }
    public int RestSeconds { get; init; }
    public int ExerciseSeconds { get; init; }
}
