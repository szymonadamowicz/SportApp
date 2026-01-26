namespace ApiModule.Domain;

public sealed class AppUser
{
    public Guid Id { get; set; }
    public string Login { get; set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public AppUser() { }

    public AppUser(Guid id, string login)
    {
        Id = id;
        Login = login;
    }
    public void SetPasswordHash(string hash)
    {
        PasswordHash = hash ?? string.Empty;
    }
}
