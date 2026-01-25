namespace ApiModule.Api.Contracts.Progress;

public sealed class StreakDto
{
    public int Current { get; init; }
    public int Longest { get; init; }
    public DateTime? LastWorkoutDate { get; init; }
}
