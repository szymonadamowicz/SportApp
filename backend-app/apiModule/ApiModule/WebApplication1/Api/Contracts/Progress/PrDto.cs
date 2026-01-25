namespace ApiModule.Api.Contracts.Progress;

public sealed class PrDto
{
    public string ExerciseName { get; init; } = string.Empty;
    public decimal MaxWeight { get; init; }
}
