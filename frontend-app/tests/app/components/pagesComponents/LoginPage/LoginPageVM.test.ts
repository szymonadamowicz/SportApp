import { act, renderHook } from "@testing-library/react";
import { useLoginPageVM } from "@/components/pagesComponents/LoginPage/LoginPageVM";

const replaceMock = jest.fn();
const loginMock = jest.fn();
const registerMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

jest.mock("@/hooks/auth/useAuth", () => ({
  useAuth: () => ({
    login: loginMock,
    register: registerMock,
  }),
}));

describe("useLoginPageVM", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("shows success message and redirects after successful login", async () => {
    loginMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useLoginPageVM());

    act(() => {
      result.current.setLogin("john");
      result.current.setPassword("pw");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.successMessage).toBe("Login successful. Redirecting...");

    act(() => {
      jest.advanceTimersByTime(700);
    });

    expect(replaceMock).toHaveBeenCalledWith("/dashboard");
  });
});
