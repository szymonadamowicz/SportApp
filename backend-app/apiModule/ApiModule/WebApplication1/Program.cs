using ApiModule.Application;
using ApiModule.Domain;
using ApiModule.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin();
    });
});


builder.Services.AddSingleton<IWorkoutRepository, InMemoryWorkoutRepository>();
builder.Services.AddSingleton<IUserRepository, InMemoryUserRepository>();

builder.Services.AddScoped<WorkoutService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProgressService>();
 
var app = builder.Build();

Seed(app.Services);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");

app.MapControllers();

app.Run();

static void Seed(IServiceProvider sp)
{
    using var scope = sp.CreateScope();

    var users = scope.ServiceProvider.GetRequiredService<IUserRepository>();
    users.CreateAsync(new AppUser
    {
        Id = Guid.NewGuid(),
        Login = "demo",
        PasswordHash = "demo"
    }, CancellationToken.None).GetAwaiter().GetResult();

    var repo = scope.ServiceProvider.GetRequiredService<IWorkoutRepository>();

    var w = new Workout
    {
        Id = Guid.NewGuid(),
        Title = "Upper Body (Push)",
        ScheduledAt = DateTime.UtcNow.AddDays(1),
        MuscleGroups = new List<string> { "Chest", "Triceps", "Shoulders" },
        MainFocus = "Hypertrophy",
        Exercises = new List<Exercise>
        {
            new() { Id = Guid.NewGuid(), Name = "Bench Press", Sets = 4, Reps = 8, Weight = 80, RestTimeSec = 120 },
            new() { Id = Guid.NewGuid(), Name = "Overhead Press", Sets = 3, Reps = 10, Weight = 45, RestTimeSec = 120 },
        }
    };

    repo.AddAsync(w, CancellationToken.None).GetAwaiter().GetResult();
}