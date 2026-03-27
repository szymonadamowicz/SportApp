import { loginMock } from "@/api/apiMock/login/login.mock";
import { mockAuthService } from "@/mocks/services/mockAuth.service";

jest.mock("@/mocks/services/mockAuth.service", () => ({
  mockAuthService: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

const mockAuthServiceMock = mockAuthService as jest.Mocked<
  typeof mockAuthService
>;

describe("loginMock adapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates login to mockAuthService", async () => {
    mockAuthServiceMock.login.mockResolvedValue("mock:john");

    const token = await loginMock.login({ login: "john", password: "x" });

    expect(mockAuthServiceMock.login).toHaveBeenCalledWith({
      login: "john",
      password: "x",
    });
    expect(token).toBe("mock:john");
  });

  it("delegates register to mockAuthService", async () => {
    mockAuthServiceMock.register.mockResolvedValue("mock:new");

    const token = await loginMock.register({
      login: "new",
      password: "x",
      repeatPassword: "x",
    });

    expect(mockAuthServiceMock.register).toHaveBeenCalledWith({
      login: "new",
      password: "x",
      repeatPassword: "x",
    });
    expect(token).toBe("mock:new");
  });
});
