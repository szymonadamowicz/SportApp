namespace ApiModule.Api.Contracts;

public sealed class UpdateWorkoutStructureDto
{
    public string Title { get; set; } = string.Empty;
    public List<ExerciseDto> Exercises { get; set; } = [];
}
