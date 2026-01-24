using ApiModule.Application;
using ApiModule.Domain;
using ApiModule.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Postgres"));
});


builder.Services.AddScoped<IWorkoutRepository, EfWorkoutRepository>();
builder.Services.AddScoped<IUserRepository, EfUserRepository>();

builder.Services.AddScoped<WorkoutService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProgressService>();

builder.Services.AddScoped<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");

app.MapControllers();

app.Run();
