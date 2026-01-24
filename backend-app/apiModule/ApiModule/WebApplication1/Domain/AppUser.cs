namespace ApiModule.Domain;

public sealed class AppUser
{
    public Guid Id { get; set; }
    public string Login { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
}
