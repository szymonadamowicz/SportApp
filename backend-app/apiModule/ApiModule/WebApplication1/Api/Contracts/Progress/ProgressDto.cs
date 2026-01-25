namespace ApiModule.Api.Contracts.Progress;

public sealed class ProgressDto
{
    public StreakDto Streak { get; init; } = new();
    public ProgressStatsDto Stats { get; init; } = new();
    public List<PrDto> Prs { get; init; } = [];
}
