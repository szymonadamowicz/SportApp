using ApiModule.Api.Contracts.Profile;
using ApiModule.Domain;

namespace ApiModule.Api;

public static class ProfileMapper
{
    public static ProfileDto ToDto(Profile profile)
    {
        return new ProfileDto
        {
            Name = profile.Name,
            Email = profile.Email,
            BirthDate = profile.BirthDate.HasValue
                ? profile.BirthDate.Value.ToString("yyyy-MM-dd")
                : null
        };
    }
}
