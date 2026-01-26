namespace ApiModule.Api.Contracts.Profile;

public sealed class UpdateProfileDto
{
    public string? Name { get; init; }
    public string? Email { get; init; }
    public string? BirthDate { get; init; }
}
