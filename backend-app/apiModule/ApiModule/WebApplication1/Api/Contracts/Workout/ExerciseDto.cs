namespace ApiModule.Api.Contracts.Workout;

public sealed class ExerciseDto
{
	public Guid Id { get; init; }
	public string Name { get; init; } = string.Empty;
	public int Sets { get; init; }
	public int Reps { get; init; }
	public decimal Weight { get; init; }
	public int RestTimeSec { get; init; }
}
