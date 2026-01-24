namespace ApiModule.Domain;

public interface ICurrentUser
{
    Guid UserId { get; }
    string Login { get; }
}
