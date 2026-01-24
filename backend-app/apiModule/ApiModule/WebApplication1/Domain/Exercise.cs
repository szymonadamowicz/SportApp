namespace ApiModule.Domain;

public sealed class Exercise
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public int Reps { get; set; }
    public int? Weight { get; set; }
    public int? RestTimeSec { get; set; }
}
