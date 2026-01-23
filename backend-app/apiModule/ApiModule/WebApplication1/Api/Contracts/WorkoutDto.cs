namespace ApiModule.Api.Contracts;

public sealed class WorkoutDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string ScheduledAt { get; set; } = string.Empty;
    public string? CompletedAt { get; set; }

    public string[] MuscleGroups { get; set; } = Array.Empty<string>();
    public string? MainFocus { get; set; }
    public string? PerceivedLoad { get; set; }

    public List<ExerciseDto> Exercises { get; set; } = new();
}
