namespace ApiModule.Domain
{
    public sealed class Workout
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime ScheduledAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<string> MuscleGroups { get; set; } = new();
        public string? MainFocus { get; set; }
        public string? PerceivedLoad { get; set; }
        public List<Exercise> Exercises { get; set; } = new();
        public Guid? OwnerUserId { get; set; }
    }
}
