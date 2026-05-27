using ApiModule.Api.Contracts.FormAnalysis;

namespace ApiModule.Application.FormAnalysis;

public sealed class FormAnalysisMetadata
{
    public Guid AnalysisId { get; init; }
    public Guid OwnerUserId { get; init; }
    public string ExerciseType { get; init; } = string.Empty;
    public string SourceFileName { get; init; } = string.Empty;
    public string? AnalyzedFileName { get; init; }
    public FormAnalysisResultDto Result { get; init; } = new();
}
