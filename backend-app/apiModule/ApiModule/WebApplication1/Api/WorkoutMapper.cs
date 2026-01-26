using ApiModule.Api.Contracts.Workout;
using ApiModule.Domain;

namespace ApiModule.Api;

public static class WorkoutMapper
{
    public static WorkoutDto ToDto(Workout workout)
        => new(
            workout.Id,
            workout.Title,
            workout.ScheduledAt,
            workout.CompletedAt,
            workout.PerceivedLoad,
            workout.MuscleGroups?.ToArray() ?? [],
            workout.Exercises.Select(ToDto).ToList()
        );

    public static ExerciseDto ToDto(Exercise e)
        => new(
            e.Id,
            e.Name,
            e.Sets,
            e.Reps,
            e.RestTimeSec,
            e.Weight
        );

    public static Workout ToDomain(CreateWorkoutDto dto)
        => new()
        {
            Id = Guid.NewGuid(),
            Title = dto.Title ?? string.Empty,
            ScheduledAt = dto.ScheduledAt,
            CompletedAt = null,
            PerceivedLoad = null,
            MuscleGroups = dto.MuscleGroups?.ToList() ?? [],
            Exercises = dto.Exercises.Select(ToDomain).ToList()
        };

    public static Exercise ToDomain(CreateExerciseDto dto)
        => new()
        {
            Id = Guid.NewGuid(),
            Name = dto.Name ?? string.Empty,
            Sets = dto.Sets ?? 0,
            Reps = dto.Reps ?? 0,
            RestTimeSec = dto.RestTimeSec ?? 0,
            Weight = dto.Weight ?? 0m
        };

    public static Exercise ToDomain(ExerciseDto dto)
        => new()
        {
            Id = dto.Id,
            Name = dto.Name ?? string.Empty,
            Sets = dto.Sets ?? 0,
            Reps = dto.Reps ?? 0,
            RestTimeSec = dto.RestTimeSec ?? 0,
            Weight = dto.Weight ?? 0m
        };
}
