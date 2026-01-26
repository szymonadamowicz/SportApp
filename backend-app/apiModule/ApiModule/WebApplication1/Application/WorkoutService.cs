using ApiModule.Domain;

namespace ApiModule.Application;

public sealed class WorkoutService(IWorkoutRepository repo, ICurrentUser currentUser)
{
    private readonly IWorkoutRepository _repo = repo;
    private readonly ICurrentUser _currentUser = currentUser;

    public Task<List<Workout>> GetAllAsync(CancellationToken ct)
    {
        return _repo.GetAllByOwnerAsync(_currentUser.UserId, ct);
    }

    public Task<Workout?> GetLastCompletedAsync(CancellationToken ct)
    {
        return _repo.GetLastCompletedForOwnerAsync(_currentUser.UserId, ct);
    }

    public async Task<Workout> CreateAsync(Workout workout, CancellationToken ct)
    {
        if (workout.Exercises.Count == 0)
            throw new ArgumentException("Workout must contain at least one exercise");

        NormalizeTitle(workout);
        NormalizeDates(workout);
        ValidateExercises(workout.Exercises);

        workout.SetOwner(_currentUser.UserId);

        await _repo.AddAsync(workout, ct);
        return workout;
    }

    public async Task<Workout?> UpdateStructureAsync(
        Guid id,
        List<Exercise> exercises,
        string title,
        CancellationToken ct)
    {
        var workout = await _repo.GetByIdForOwnerAsync(id, _currentUser.UserId, ct);
        if (workout is null)
            return null;

        if (exercises.Count == 0)
            throw new ArgumentException("Workout must contain at least one exercise");

        workout.Title = title;
        NormalizeTitle(workout);
        ValidateExercises(exercises);

        workout.Exercises = exercises;

        await _repo.UpdateAsync(workout, ct);
        return workout;
    }

    public async Task<Workout?> UpdatePartialAsync(
        Guid id,
        DateTime? scheduledAt,
        DateTime? completedAt,
        string? perceivedLoad,
        CancellationToken ct)
    {
        var workout = await _repo.GetByIdForOwnerAsync(id, _currentUser.UserId, ct);
        if (workout is null)
            return null;

        if (scheduledAt.HasValue)
            workout.ScheduledAt = NormalizeUtc(scheduledAt.Value);

        if (completedAt.HasValue)
            workout.CompletedAt = NormalizeUtc(completedAt.Value);

        if (perceivedLoad != null)
            workout.PerceivedLoad = perceivedLoad.Trim();

        await _repo.UpdateAsync(workout, ct);
        return workout;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var workout = await _repo.GetByIdForOwnerAsync(id, _currentUser.UserId, ct);
        if (workout is null)
            return false;

        await _repo.DeleteAsync(workout, ct);
        return true;
    }

    private static void NormalizeTitle(Workout workout)
    {
        workout.Title = workout.Title.Trim();
        if (string.IsNullOrWhiteSpace(workout.Title))
            workout.Title = "Untitled workout";
    }

    private static void NormalizeDates(Workout workout)
    {
        workout.ScheduledAt = NormalizeUtc(workout.ScheduledAt);

        if (workout.CompletedAt.HasValue)
            workout.CompletedAt = NormalizeUtc(workout.CompletedAt.Value);
    }

    private static void ValidateExercises(List<Exercise> exercises)
    {
        if (exercises.Any(e =>
            string.IsNullOrWhiteSpace(e.Name) ||
            e.Sets <= 0 ||
            e.Reps <= 0 ||
            e.RestTimeSec < 0))
        {
            throw new ArgumentException("One or more exercises are invalid");
        }
    }

    private static DateTime NormalizeUtc(DateTime dt)
    {
        if (dt.Kind == DateTimeKind.Utc)
            return dt;

        if (dt.Kind == DateTimeKind.Local)
            return dt.ToUniversalTime();

        return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
    }
}
