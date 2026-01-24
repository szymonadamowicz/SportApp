using ApiModule.Domain;

namespace ApiModule.Application;

public sealed class UpdateWorkoutStructureCommand
{
    public string Title { get; set; } = string.Empty;
    public List<Exercise> Exercises { get; set; } = [];
}
