import { act, renderHook, waitFor } from "@testing-library/react";
import { useProfilePageVM } from "@/components/pagesComponents/ProfilePage/ProfilePageVM";
import { loginApi } from "@/api/login.api";
import {
  changePasswordApi,
  getProfileApi,
  updateProfileApi,
} from "@/api/profile.api";

jest.mock("@/hooks/auth/useAuth", () => ({
  useAuth: () => ({
    session: { user: { login: "john" } },
    logout: jest.fn(),
  }),
}));

jest.mock("@/api/login.api", () => ({
  loginApi: jest.fn(),
}));

jest.mock("@/api/profile.api", () => ({
  getProfileApi: jest.fn(),
  updateProfileApi: jest.fn(),
  changePasswordApi: jest.fn(),
}));

describe("useProfilePageVM", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getProfileApi as jest.Mock).mockResolvedValue({
      name: "",
      email: "",
      birthDate: "",
    });
    (updateProfileApi as jest.Mock).mockResolvedValue({});
    (loginApi as jest.Mock).mockResolvedValue("mock:john");
    (changePasswordApi as jest.Mock).mockResolvedValue(undefined);
  });

  it("uses verified password as currentPassword when changing password", async () => {
    const { result } = renderHook(() => useProfilePageVM());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setVerifyPassword("old-pass");
    });

    await act(async () => {
      await result.current.verify();
    });

    act(() => {
      result.current.setNewPassword("ab");
      result.current.setRepeatNewPassword("ab");
    });

    expect(result.current.canChangePassword).toBe(true);

    await act(async () => {
      await result.current.changePassword();
    });

    expect(changePasswordApi).toHaveBeenCalledWith({
      currentPassword: "old-pass",
      newPassword: "ab",
    });
  });
});
