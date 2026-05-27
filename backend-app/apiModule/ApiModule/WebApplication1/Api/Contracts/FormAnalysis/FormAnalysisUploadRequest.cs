using Microsoft.AspNetCore.Http;

namespace ApiModule.Api.Contracts.FormAnalysis;

public sealed class FormAnalysisUploadRequest
{
    public IFormFile? Video { get; init; }
    public string ExerciseType { get; init; } = "squat";
}
