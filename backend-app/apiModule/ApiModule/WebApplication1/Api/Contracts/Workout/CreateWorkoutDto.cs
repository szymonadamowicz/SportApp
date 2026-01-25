namespace ApiModule.Api.Contracts.Workout
{
    public sealed class CreateWorkoutDto
    {
        public string? Title { get; init; }
        public DateTime ScheduledAt { get; init; }
        public string[] MuscleGroups { get; init; } = [];
        public List<CreateExerciseDto> Exercises { get; init; } = [];
    }
}
