namespace ApiModule.Api.Contracts.Workout;

public record CreateExerciseDto(
    string? Name,
    int? Sets,
    int? Reps,
    int? RestTimeSec,
    decimal? Weight
);
