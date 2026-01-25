namespace ApiModule.Api.Contracts.Workout;

public sealed class WorkoutDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public DateTime ScheduledAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public string? PerceivedLoad { get; init; }
    public string[] MuscleGroups { get; init; } = [];
    public List<ExerciseDto> Exercises { get; init; } = [];
}
