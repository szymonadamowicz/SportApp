namespace ApiModule.Api.Contracts.Workout;

public record UpdateWorkoutStructureDto(
    string Title,
    List<ExerciseDto> Exercises
);
