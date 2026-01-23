namespace ApiModule.Application;

public sealed class UpdateWorkoutCommand
{
    public string? ScheduledAt { get; set; }
    public string? CompletedAt { get; set; }
    public string? PerceivedLoad { get; set; }
}
