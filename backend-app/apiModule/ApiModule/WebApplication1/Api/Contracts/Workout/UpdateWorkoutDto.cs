namespace ApiModule.Api.Contracts.Workout;

public sealed class UpdateWorkoutDto
{
    public DateTime? ScheduledAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public string? PerceivedLoad { get; init; }
}
