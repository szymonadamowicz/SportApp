import { mockProfileService } from "@/mocks/services/mockProfile.service";
import { getMockLoginFromToken } from "@/contexts/auth/authMock";
import { profilesRepository } from "@/mocks/repositories/profiles.repository";
import { usersRepository } from "@/mocks/repositories/users.repository";

jest.mock("@/mocks/runtime/delay", () => ({
  mockDelay: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/contexts/auth/authMock", () => ({
  getMockLoginFromToken: jest.fn(),
}));

jest.mock("@/mocks/repositories/profiles.repository", () => ({
  profilesRepository: {
    getByLogin: jest.fn(),
    upsert: jest.fn(),
  },
}));

jest.mock("@/mocks/repositories/users.repository", () => ({
  usersRepository: {
    getByLogin: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

const getMockLoginFromTokenMock = getMockLoginFromToken as jest.MockedFunction<
  typeof getMockLoginFromToken
>;

const profilesRepositoryMock = profilesRepository as jest.Mocked<
  typeof profilesRepository
>;

const usersRepositoryMock = usersRepository as jest.Mocked<
  typeof usersRepository
>;

describe("mockProfileService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getMockLoginFromTokenMock.mockReturnValue("john");
  });

  it("reads profile for current mock user", async () => {
    profilesRepositoryMock.getByLogin.mockReturnValue({
      name: "John",
      email: "john@fit.local",
      birthDate: "2000-01-01",
    });

    const profile = await mockProfileService.getProfile();

    expect(getMockLoginFromTokenMock).toHaveBeenCalled();
    expect(profilesRepositoryMock.getByLogin).toHaveBeenCalledWith("john");
    expect(profile.email).toBe("john@fit.local");
  });

  it("updates profile for current mock user", async () => {
    profilesRepositoryMock.upsert.mockReturnValue({
      name: "John Updated",
      email: "updated@fit.local",
      birthDate: "2000-01-01",
    });

    const result = await mockProfileService.updateProfile({
      name: "John Updated",
      email: "updated@fit.local",
    });

    expect(profilesRepositoryMock.upsert).toHaveBeenCalledWith("john", {
      name: "John Updated",
      email: "updated@fit.local",
    });
    expect(result.name).toBe("John Updated");
  });

  it("throws when user is missing during password change", async () => {
    usersRepositoryMock.getByLogin.mockReturnValue(undefined);

    await expect(
      mockProfileService.changePassword({
        currentPassword: "old",
        newPassword: "new",
      }),
    ).rejects.toThrow("User not found");

    expect(usersRepositoryMock.updatePassword).not.toHaveBeenCalled();
  });

  it("throws when current password is invalid", async () => {
    usersRepositoryMock.getByLogin.mockReturnValue({ password: "other" });

    await expect(
      mockProfileService.changePassword({
        currentPassword: "old",
        newPassword: "new",
      }),
    ).rejects.toThrow("Invalid current password");

    expect(usersRepositoryMock.updatePassword).not.toHaveBeenCalled();
  });

  it("updates password when current password is valid", async () => {
    usersRepositoryMock.getByLogin.mockReturnValue({ password: "old" });

    await mockProfileService.changePassword({
      currentPassword: "old",
      newPassword: "new",
    });

    expect(usersRepositoryMock.updatePassword).toHaveBeenCalledWith(
      "john",
      "new",
    );
  });
});
