using ApiModule.Application;
using ApiModule.Application.FormAnalysis;
using ApiModule.Domain;
using ApiModule.Infrastructure;
using ApiModule.Infrastructure.Auth;
using ApiModule.Infrastructure.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var runtimeSettings = RuntimeSettings.Resolve(builder.Configuration);
var corsAllowedOrigins = ResolveCorsAllowedOrigins(builder.Configuration);

builder.Services.AddControllers();
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = ResolveMaxMultipartBytes(builder.Configuration);
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "ApiModule",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter JWT token in the format: Bearer {your token}"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod();

        if (corsAllowedOrigins.Length > 0)
        {
            policy.WithOrigins(corsAllowedOrigins);
        }
        else if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin();
        }
        else
        {
            policy.WithOrigins("http://localhost:3000");
        }
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(runtimeSettings.ConnectionString);
});

builder.Services.AddScoped<IWorkoutRepository, EfWorkoutRepository>();
builder.Services.AddScoped<IWorkoutRunRepository, EfWorkoutRunRepository>();
builder.Services.AddScoped<IUserRepository, EfUserRepository>();
builder.Services.AddScoped<IProfileRepository, EfProfileRepository>();

builder.Services.AddScoped<WorkoutService>();
builder.Services.AddScoped<WorkoutRunService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProgressService>();
builder.Services.AddScoped<ProfileService>();
builder.Services.AddScoped<FormAnalysisService>();

builder.Services.AddScoped<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();

builder.Services.AddSingleton<IOptions<JwtOptions>>(Options.Create(runtimeSettings.Jwt));
builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = runtimeSettings.Jwt.Issuer,
            ValidAudience = runtimeSettings.Jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(runtimeSettings.Jwt.Key)),

            ClockSkew = TimeSpan.FromSeconds(10)
        };
    });

builder.Services.AddAuthorization();


var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    utc = DateTime.UtcNow
})).AllowAnonymous();

app.MapControllers();

app.Run();

static string[] ResolveCorsAllowedOrigins(IConfiguration configuration)
{
    var values = configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>() ?? [];
    var scalar = configuration["Cors:AllowedOrigins"];

    return values
        .Concat(SplitSetting(scalar))
        .Select(origin => origin.Trim().TrimEnd('/'))
        .Where(origin => !string.IsNullOrWhiteSpace(origin))
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToArray();
}

static long ResolveMaxMultipartBytes(IConfiguration configuration)
{
    const int defaultMegabytes = 250;
    var configured = configuration["FormAnalysis:MaxVideoMegabytes"];

    if (int.TryParse(configured, out var megabytes))
    {
        return Math.Clamp(megabytes, 1, defaultMegabytes) * 1024L * 1024L;
    }

    return defaultMegabytes * 1024L * 1024L;
}

static IEnumerable<string> SplitSetting(string? value) =>
    string.IsNullOrWhiteSpace(value)
        ? []
        : value.Split([';', ',', ' '], StringSplitOptions.RemoveEmptyEntries);
