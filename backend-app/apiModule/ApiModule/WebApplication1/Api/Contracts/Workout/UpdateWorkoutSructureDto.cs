namespace ApiModule.Api.Contracts.Workout;

public sealed class UpdateWorkoutStructureDto
{
    public string Title { get; init; } = string.Empty;
    public List<ExerciseDto> Exercises { get; init; } = [];
}
