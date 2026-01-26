namespace ApiModule.Api.Contracts.Workout;

public record WorkoutDto(
    Guid Id,
    string Title,
    DateTime ScheduledAt,
    DateTime? CompletedAt,
    string? PerceivedLoad,
    string[] MuscleGroups,
    List<ExerciseDto> Exercises
);
