namespace ApiModule.Domain;

public class Exercise
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public int RestTimeSec { get; set; }
    public decimal Weight { get; set; }

    public Guid WorkoutId { get; set; }
    public Workout Workout { get; set; } = null!;
}
