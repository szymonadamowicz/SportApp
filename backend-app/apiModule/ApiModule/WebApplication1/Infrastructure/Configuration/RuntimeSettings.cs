using ApiModule.Infrastructure.Auth;

namespace ApiModule.Infrastructure.Configuration;

public sealed class RuntimeSettings
{
    public const string DevelopmentJwtKey = "dev-only-change-me-to-at-least-32-characters";

    public string ConnectionString { get; init; } =
        "Host=localhost;Port=5432;Database=workoutdb;Username=workout_user;Password=workout_pass";

    public JwtOptions Jwt { get; init; } = new()
    {
        Issuer = "ApiModule",
        Audience = "ApiModule.Client",
        Key = DevelopmentJwtKey,
        ExpiresMinutes = 120
    };

    public static RuntimeSettings Resolve(IConfiguration configuration)
    {
        var configuredJwt = configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();

        var connectionString = FirstNonEmpty(
            configuration.GetConnectionString("Default"),
            configuration["ConnectionStrings__Default"],
            "Host=localhost;Port=5432;Database=workoutdb;Username=workout_user;Password=workout_pass"
        );

        var jwt = new JwtOptions
        {
            Issuer = FirstNonEmpty(
                configuredJwt.Issuer,
                configuration["Jwt__Issuer"],
                configuration["JWT_ISSUER"],
                "ApiModule"
            ),
            Audience = FirstNonEmpty(
                configuredJwt.Audience,
                configuration["Jwt__Audience"],
                configuration["JWT_AUDIENCE"],
                "ApiModule.Client"
            ),
            Key = FirstNonEmpty(
                configuredJwt.Key,
                configuration["Jwt__Key"],
                configuration["JWT_KEY"],
                DevelopmentJwtKey
            ),
            ExpiresMinutes = configuredJwt.ExpiresMinutes > 0
                ? configuredJwt.ExpiresMinutes
                : int.TryParse(
                    FirstNonEmpty(configuration["Jwt__ExpiresMinutes"], configuration["JWT_EXPIRES_MINUTES"]),
                    out var parsedExpires
                )
                    ? parsedExpires
                    : 120
        };

        return new RuntimeSettings
        {
            ConnectionString = connectionString,
            Jwt = jwt
        };
    }

    private static string FirstNonEmpty(params string?[] values)
    {
        foreach (var value in values)
        {
            if (!string.IsNullOrWhiteSpace(value))
                return value;
        }

        return string.Empty;
    }
}
