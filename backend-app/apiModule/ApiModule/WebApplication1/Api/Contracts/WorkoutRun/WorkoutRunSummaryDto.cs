namespace ApiModule.Api.Contracts.WorkoutRun;

public sealed class WorkoutRunSummaryDto
{
    public Guid RunId { get; init; }
    public Guid WorkoutId { get; init; }
    public DateTime FinishedAt { get; init; }

    public int TotalSets { get; init; }
    public int MetTargetSets { get; init; }
    public int ExpectedRepsTotal { get; init; }
    public int ActualRepsTotal { get; init; }
    public decimal CompletionRate { get; init; }
}
