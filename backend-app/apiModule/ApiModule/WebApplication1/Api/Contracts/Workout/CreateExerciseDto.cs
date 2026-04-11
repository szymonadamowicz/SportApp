namespace ApiModule.Api.Contracts.Workout;

public record CreateExerciseDto(
    int? OrderIndex,
    string? Name,
    int? Sets,
    int? Reps,
    int? RestTimeSec,
    decimal? Weight
);
