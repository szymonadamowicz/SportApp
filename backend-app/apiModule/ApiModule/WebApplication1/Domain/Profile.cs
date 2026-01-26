namespace ApiModule.Domain;

public sealed class Profile
{
    public Guid OwnerId { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public DateOnly? BirthDate { get; set; }
}
