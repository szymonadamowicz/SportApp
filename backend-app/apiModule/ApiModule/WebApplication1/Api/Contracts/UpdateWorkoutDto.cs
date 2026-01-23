namespace ApiModule.Api.Contracts;

public sealed class UpdateWorkoutDto
{
    public string? ScheduledAt { get; set; }
    public string? CompletedAt { get; set; }
    public string? PerceivedLoad { get; set; }
}
