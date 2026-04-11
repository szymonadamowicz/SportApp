namespace ApiModule.Domain;

public sealed class WorkoutRunEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid WorkoutRunId { get; set; }
    public WorkoutRun WorkoutRun { get; set; } = null!;

    public Guid ExerciseId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;

    public int StepIndex { get; set; }
    public int SetNumber { get; set; }
    public int ExpectedReps { get; set; }
    public int ActualReps { get; set; }
    public bool MetTarget { get; set; }

    public int ExerciseDurationSec { get; set; }
    public int RestDurationSec { get; set; }
    public DateTime CompletedAt { get; set; }
}
