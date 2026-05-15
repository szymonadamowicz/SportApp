namespace ApiModule.Domain;

public sealed class WorkoutRun
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WorkoutId { get; set; }
    public Workout Workout { get; set; } = null!;

    public Guid OwnerUserId { get; set; }

    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public int? DurationSec { get; set; }
    public string? Notes { get; set; }

    public List<WorkoutRunEntry> Entries { get; set; } = [];
}
