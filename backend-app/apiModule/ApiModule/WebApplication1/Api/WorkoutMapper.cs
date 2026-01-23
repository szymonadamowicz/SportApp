using System.Globalization;
using ApiModule.Api.Contracts;
using ApiModule.Domain;

namespace ApiModule.Api;

public static class WorkoutMapper
{
    public static WorkoutDto ToDto(Workout w) => new()
    {
        Id = w.Id.ToString(),
        Title = w.Title,
        ScheduledAt = w.ScheduledAt.ToString("O"),
        CompletedAt = w.CompletedAt?.ToString("O"),
        MuscleGroups = w.MuscleGroups.ToArray(),
        MainFocus = w.MainFocus,
        PerceivedLoad = w.PerceivedLoad,
        Exercises = w.Exercises.Select(ToDto).ToList()
    };

    public static Workout ToDomain(WorkoutDto dto)
    {
        var id = TryGuid(dto.Id) ?? Guid.NewGuid();

        return new Workout
        {
            Id = id,
            Title = dto.Title,
            ScheduledAt = ParseIso(dto.ScheduledAt),
            CompletedAt = string.IsNullOrWhiteSpace(dto.CompletedAt) ? null : ParseIso(dto.CompletedAt!),
            MuscleGroups = dto.MuscleGroups?.ToList() ?? new List<string>(),
            MainFocus = dto.MainFocus,
            PerceivedLoad = dto.PerceivedLoad,
            Exercises = dto.Exercises.Select(ToDomain).ToList()
        };
    }

    public static ExerciseDto ToDto(Exercise e) => new()
    {
        Id = e.Id.ToString(),
        Name = e.Name,
        Sets = e.Sets,
        Reps = e.Reps,
        Weight = e.Weight,
        RestTimeSec = e.RestTimeSec
    };

    public static Exercise ToDomain(ExerciseDto dto)
    {
        var id = TryGuid(dto.Id) ?? Guid.NewGuid();

        return new Exercise
        {
            Id = id,
            Name = dto.Name,
            Sets = dto.Sets,
            Reps = dto.Reps,
            Weight = dto.Weight,
            RestTimeSec = dto.RestTimeSec
        };
    }

    private static Guid? TryGuid(string? s)
        => Guid.TryParse(s, out var g) ? g : null;

    private static DateTime ParseIso(string s)
        => DateTime.Parse(s, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind);
}
