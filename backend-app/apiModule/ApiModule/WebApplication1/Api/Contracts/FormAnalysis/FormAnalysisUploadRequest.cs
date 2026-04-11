using Microsoft.AspNetCore.Http;

namespace ApiModule.Api.Contracts.FormAnalysis;

public sealed class FormAnalysisUploadRequest
{
    public IFormFile? Video { get; init; }
    public string ExerciseType { get; init; } = "squat";
    public Guid? WorkoutRunId { get; init; }
    public Guid? WorkoutId { get; init; }
    public Guid? ExerciseId { get; init; }
    public string? ExerciseName { get; init; }
    public int? StepIndex { get; init; }
    public int? SetNumber { get; init; }
}
