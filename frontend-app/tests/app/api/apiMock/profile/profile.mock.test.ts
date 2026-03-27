import { profileMock } from "@/api/apiMock/profile/profile.mock";
import { mockProfileService } from "@/mocks/services/mockProfile.service";

jest.mock("@/mocks/services/mockProfile.service", () => ({
  mockProfileService: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  },
}));

const mockProfileServiceMock = mockProfileService as jest.Mocked<
  typeof mockProfileService
>;

describe("profileMock adapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates getProfile", async () => {
    mockProfileServiceMock.getProfile.mockResolvedValue({
      name: "John",
      email: "john@fit.local",
      birthDate: "2000-01-01",
    });

    const result = await profileMock.getProfile();

    expect(mockProfileServiceMock.getProfile).toHaveBeenCalled();
    expect(result.name).toBe("John");
  });

  it("delegates updateProfile", async () => {
    mockProfileServiceMock.updateProfile.mockResolvedValue({
      name: "Updated",
      email: "updated@fit.local",
      birthDate: "2000-01-01",
    });

    const result = await profileMock.updateProfile({
      name: "Updated",
      email: "updated@fit.local",
    });

    expect(mockProfileServiceMock.updateProfile).toHaveBeenCalledWith({
      name: "Updated",
      email: "updated@fit.local",
    });
    expect(result.email).toBe("updated@fit.local");
  });

  it("delegates changePassword", async () => {
    mockProfileServiceMock.changePassword.mockResolvedValue(undefined);

    await profileMock.changePassword({
      currentPassword: "old",
      newPassword: "new",
    });

    expect(mockProfileServiceMock.changePassword).toHaveBeenCalledWith({
      currentPassword: "old",
      newPassword: "new",
    });
  });
});
