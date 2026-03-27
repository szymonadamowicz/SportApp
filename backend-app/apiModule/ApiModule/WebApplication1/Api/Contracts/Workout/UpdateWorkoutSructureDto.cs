namespace ApiModule.Api.Contracts.Workout;

public record UpdateWorkoutStructureDto(
    string Title,
    string[] MuscleGroups,
    List<ExerciseDto> Exercises
);
