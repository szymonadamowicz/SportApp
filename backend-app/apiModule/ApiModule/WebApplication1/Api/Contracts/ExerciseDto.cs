namespace ApiModule.Api.Contracts;

public sealed class ExerciseDto
{
	public string Id { get; set; } = string.Empty;
	public string Name { get; set; } = string.Empty;
	public int Sets { get; set; }
	public int Reps { get; set; }
	public int? Weight { get; set; }
	public int? RestTimeSec { get; set; }
}
