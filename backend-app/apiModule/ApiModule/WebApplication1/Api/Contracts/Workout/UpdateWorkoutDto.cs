namespace ApiModule.Api.Contracts.Workout;

public sealed class UpdateWorkoutDto
{
    public string? ScheduledAt { get; init; }
    public string? CompletedAt { get; init; }
    public string? PerceivedLoad { get; init; }
}
