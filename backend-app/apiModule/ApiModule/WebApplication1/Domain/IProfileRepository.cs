using ApiModule.Domain;

namespace ApiModule.Domain;

public interface IProfileRepository
{
    Task<Profile?> GetByOwnerIdAsync(Guid ownerId, CancellationToken ct);
    Task UpsertAsync(Profile profile, CancellationToken ct);
}
