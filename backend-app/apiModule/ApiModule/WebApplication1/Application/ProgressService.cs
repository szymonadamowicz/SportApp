namespace ApiModule.Application;

public sealed class ProgressService
{
    public object GetProgress()
    {
        return new
        {
            achievements = Array.Empty<object>(),
            streak = new { days = 0 }
        };
    }
}
