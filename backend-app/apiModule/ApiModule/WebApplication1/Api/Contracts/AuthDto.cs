namespace ApiModule.Api.Contracts;

public sealed class LoginDto
{
    public string Login { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public sealed class RegisterDto
{
    public string Login { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string RepeatPassword { get; set; } = string.Empty;
}
