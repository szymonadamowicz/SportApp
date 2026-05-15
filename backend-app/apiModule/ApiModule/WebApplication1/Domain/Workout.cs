namespace ApiModule.Domain;

public class Workout
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }

    public DateTime? CompletedAt { get; set; }
    public string? PerceivedLoad { get; set; }

    public List<string> MuscleGroups { get; set; } = new();
    public List<Exercise> Exercises { get; set; } = new();
    public List<WorkoutRun> Runs { get; set; } = new();

    public Guid OwnerUserId { get; set; }
}
