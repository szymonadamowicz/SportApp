namespace ApiModule.Api.Contracts.FormAnalysis;

public sealed class FormAnalysisResultDto
{
    public Guid AnalysisId { get; init; }
    public string ExerciseType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public int? Score { get; init; }
    public string Summary { get; init; } = string.Empty;
    public List<string> Findings { get; init; } = [];
    public List<FormAnalysisMetricDto> Metrics { get; init; } = [];
    public bool HasSourceVideo { get; init; }
    public bool HasAnalyzedVideo { get; init; }
}
