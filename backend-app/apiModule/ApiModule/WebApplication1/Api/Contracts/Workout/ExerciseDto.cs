namespace ApiModule.Api.Contracts.Workout;

public record ExerciseDto(
    Guid Id,
    int OrderIndex,
    string? Name,
    int? Sets,
    int? Reps,
    int? RestTimeSec,
    decimal? Weight
);
