using ApiModule.Api.Contracts.Workout;
using ApiModule.Domain;

namespace ApiModule.Api;

public static class WorkoutMapper
{
    public static WorkoutDto ToDto(Workout workout)
    {
        return new WorkoutDto
        {
            Id = workout.Id,
            Title = workout.Title,
            ScheduledAt = workout.ScheduledAt,
            CompletedAt = workout.CompletedAt,
            PerceivedLoad = workout.PerceivedLoad,
            MuscleGroups = workout.MuscleGroups.ToArray() ?? [],
            Exercises = [.. workout.Exercises.Select(ToDto)]
        };
    }

    private static ExerciseDto ToDto(Exercise exercise)
    {
        return new ExerciseDto
        {
            Id = exercise.Id,
            Name = exercise.Name,
            Sets = exercise.Sets,
            Reps = exercise.Reps,
            Weight = exercise.Weight,
            RestTimeSec = exercise.RestTimeSec
        };
    }

    public static Workout ToDomain(CreateWorkoutDto dto)
    {
        var workout = new Workout
        {
            Id = Guid.NewGuid(),
            Title = dto.Title ?? string.Empty,
            ScheduledAt = dto.ScheduledAt,
            MuscleGroups = dto.MuscleGroups.ToList() ?? [],
            Exercises = [.. dto.Exercises.Select(ToDomain)]
        };

        return workout;
    }

    private static Exercise ToDomain(CreateExerciseDto dto)
    {
        return new Exercise
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Sets = dto.Sets,
            Reps = dto.Reps,
            Weight = dto.Weight,
            RestTimeSec = dto.RestTimeSec
        };
    }

    public static Exercise ToDomain(ExerciseDto dto)
    {
        return new Exercise
        {
            Id = dto.Id,
            Name = dto.Name,
            Sets = dto.Sets,
            Reps = dto.Reps,
            Weight = dto.Weight,
            RestTimeSec = dto.RestTimeSec
        };
    }
}
