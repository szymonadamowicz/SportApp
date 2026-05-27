namespace ApiModule.Api.Contracts.FormAnalysis;

public sealed class FormAnalysisResultDto
{
    public Guid AnalysisId { get; init; }
    public Guid? WorkoutRunId { get; init; }
    public Guid? WorkoutId { get; init; }
    public Guid? ExerciseId { get; init; }
    public string? ExerciseName { get; init; }
    public string ExerciseType { get; init; } = string.Empty;
    public int? StepIndex { get; init; }
    public int? SetNumber { get; init; }
    public string Status { get; init; } = string.Empty;
    public int? Score { get; init; }
    public string Summary { get; init; } = string.Empty;
    public List<string> Findings { get; init; } = [];
    public List<FormAnalysisMetricDto> Metrics { get; init; } = [];
    public bool HasSourceVideo { get; init; }
    public bool HasAnalyzedVideo { get; init; }
    public string AnalyzerVersion { get; init; } = string.Empty;
    public string? ModelName { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}
