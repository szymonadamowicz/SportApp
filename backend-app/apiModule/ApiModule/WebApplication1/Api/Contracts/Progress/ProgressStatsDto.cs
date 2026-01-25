namespace ApiModule.Api.Contracts.Progress;

public sealed class ProgressStatsDto
{
    public int TotalWorkouts { get; init; }
    public int TotalReps { get; init; }
    public decimal TotalVolume { get; init; }
    public decimal MaxWeight { get; init; }
}
