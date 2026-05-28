using ApiModule.Domain;
using ApiModule.Infrastructure.Auth;

namespace ApiModule.Tests;

internal sealed class TestCurrentUser(Guid userId, string login = "tester") : ICurrentUser
{
    public Guid UserId { get; } = userId;
    public string Login { get; } = login;
}

internal sealed class TestJwtService : IJwtService
{
    public string CreateToken(AppUser user) => $"token:{user.Id:N}:{user.Login}";
}

internal sealed class InMemoryUserRepository : IUserRepository
{
    private readonly Dictionary<Guid, AppUser> _usersById = new();

    public List<AppUser> Users => _usersById.Values.ToList();
    public int SaveCalls { get; private set; }

    public Task<AppUser?> GetByLoginAsync(string login, CancellationToken ct)
    {
        var user = _usersById.Values.FirstOrDefault(item =>
            item.Login.Equals(login, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(user);
    }

    public Task<AppUser?> GetByIdAsync(Guid id, CancellationToken ct) =>
        Task.FromResult(_usersById.GetValueOrDefault(id));

    public Task CreateAsync(AppUser user, CancellationToken ct)
    {
        _usersById[user.Id] = user;
        return Task.CompletedTask;
    }

    public Task SaveAsync(CancellationToken ct)
    {
        SaveCalls++;
        return Task.CompletedTask;
    }

    public void Add(AppUser user) => _usersById[user.Id] = user;
}

internal sealed class InMemoryProfileRepository : IProfileRepository
{
    private readonly Dictionary<Guid, Profile> _profiles = new();

    public int UpsertCalls { get; private set; }

    public Task<Profile?> GetByOwnerIdAsync(Guid ownerId, CancellationToken ct) =>
        Task.FromResult(_profiles.GetValueOrDefault(ownerId));

    public Task UpsertAsync(Profile profile, CancellationToken ct)
    {
        UpsertCalls++;
        _profiles[profile.OwnerId] = profile;
        return Task.CompletedTask;
    }
}

internal sealed class InMemoryWorkoutRepository : IWorkoutRepository
{
    private readonly Dictionary<Guid, Workout> _workouts = new();

    public Task<List<Workout>> GetAllByOwnerAsync(Guid ownerUserId, CancellationToken ct) =>
        Task.FromResult(_workouts.Values.Where(item => item.OwnerUserId == ownerUserId).ToList());

    public Task<Workout?> GetByIdForOwnerAsync(Guid id, Guid ownerUserId, CancellationToken ct)
    {
        var workout = _workouts.GetValueOrDefault(id);
        return Task.FromResult(workout?.OwnerUserId == ownerUserId ? workout : null);
    }

    public Task<Workout?> GetLastCompletedForOwnerAsync(Guid ownerUserId, CancellationToken ct)
    {
        var workout = _workouts.Values
            .Where(item => item.OwnerUserId == ownerUserId && item.CompletedAt.HasValue)
            .OrderByDescending(item => item.CompletedAt)
            .FirstOrDefault();
        return Task.FromResult(workout);
    }

    public Task AddAsync(Workout workout, CancellationToken ct)
    {
        _workouts[workout.Id] = workout;
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Workout workout, CancellationToken ct)
    {
        _workouts[workout.Id] = workout;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Workout workout, CancellationToken ct)
    {
        _workouts.Remove(workout.Id);
        return Task.CompletedTask;
    }
}

internal sealed class InMemoryWorkoutRunRepository : IWorkoutRunRepository
{
    private readonly Dictionary<Guid, WorkoutRun> _runs = new();

    public List<WorkoutRun> Runs => _runs.Values.ToList();
    public int UpdateCalls { get; private set; }
    public int ReplaceEntriesCalls { get; private set; }

    public Task AddAsync(WorkoutRun run, CancellationToken ct)
    {
        _runs[run.Id] = run;
        return Task.CompletedTask;
    }

    public Task<WorkoutRun?> GetByIdForOwnerAsync(Guid runId, Guid ownerUserId, CancellationToken ct)
    {
        var run = _runs.GetValueOrDefault(runId);
        return Task.FromResult(run?.OwnerUserId == ownerUserId ? run : null);
    }

    public Task<WorkoutRun?> GetActiveByWorkoutForOwnerAsync(
        Guid workoutId,
        Guid ownerUserId,
        CancellationToken ct)
    {
        var run = _runs.Values
            .Where(item =>
                item.WorkoutId == workoutId &&
                item.OwnerUserId == ownerUserId &&
                item.FinishedAt is null)
            .OrderByDescending(item => item.StartedAt)
            .FirstOrDefault();
        return Task.FromResult(run);
    }

    public Task<WorkoutRun?> GetLatestActiveForOwnerAsync(Guid ownerUserId, CancellationToken ct)
    {
        var run = _runs.Values
            .Where(item => item.OwnerUserId == ownerUserId && item.FinishedAt is null)
            .OrderByDescending(item => item.LastProgressAt ?? item.StartedAt)
            .FirstOrDefault();
        return Task.FromResult(run);
    }

    public Task UpdateAsync(WorkoutRun run, CancellationToken ct)
    {
        UpdateCalls++;
        _runs[run.Id] = run;
        return Task.CompletedTask;
    }

    public Task ReplaceEntriesAndUpdateAsync(
        WorkoutRun run,
        IReadOnlyCollection<WorkoutRunEntry> entries,
        CancellationToken ct)
    {
        ReplaceEntriesCalls++;
        run.Entries = entries.ToList();
        _runs[run.Id] = run;
        return Task.CompletedTask;
    }
}
