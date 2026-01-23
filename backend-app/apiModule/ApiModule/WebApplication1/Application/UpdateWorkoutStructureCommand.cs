namespace ApiModule.Application;

public sealed class UpdateWorkoutStructureCommand
{
    public string Title { get; set; } = string.Empty;
    public List<Domain.Exercise> Exercises { get; set; } = new();
}
