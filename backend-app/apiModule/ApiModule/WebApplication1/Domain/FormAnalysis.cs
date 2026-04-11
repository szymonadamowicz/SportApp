namespace ApiModule.Domain;

public sealed class FormAnalysis
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerUserId { get; set; }

    public Guid? WorkoutRunId { get; set; }
    public WorkoutRun? WorkoutRun { get; set; }

    public Guid? WorkoutId { get; set; }
    public Workout? Workout { get; set; }

    public Guid? ExerciseId { get; set; }
    public string? ExerciseName { get; set; }
    public string ExerciseType { get; set; } = "squat";
    public int? StepIndex { get; set; }
    public int? SetNumber { get; set; }

    public string Status { get; set; } = "queued";
    public int? Score { get; set; }
    public string Summary { get; set; } = string.Empty;
    public string FindingsJson { get; set; } = "[]";
    public string MetricsJson { get; set; } = "[]";
    public string? RawResultJson { get; set; }
    public string? ErrorMessage { get; set; }

    public string SourceFileName { get; set; } = string.Empty;
    public string? AnalyzedFileName { get; set; }
    public string AnalyzerVersion { get; set; } = "form-analysis-v1";
    public string? ModelName { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
