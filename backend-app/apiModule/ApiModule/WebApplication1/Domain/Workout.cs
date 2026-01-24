namespace ApiModule.Domain;

public sealed class Workout
{
    public Guid Id { get; set; }
    public Guid OwnerUserId { get; private set; }
    public string Title { get; set; } = string.Empty;
    public DateTime ScheduledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<string> MuscleGroups { get; set; } = [];
    public string? MainFocus { get; set; }
    public string? PerceivedLoad { get; set; }
    public List<Exercise> Exercises { get; set; } = [];

    public void SetOwner(Guid userId)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("Owner cannot be empty");

        if (OwnerUserId != Guid.Empty)
            throw new InvalidOperationException("Owner already set");

        OwnerUserId = userId;
    }
}
