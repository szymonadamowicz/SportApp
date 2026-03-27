import { mockAuthService } from "@/mocks/services/mockAuth.service";
import { usersRepository } from "@/mocks/repositories/users.repository";

jest.mock("@/mocks/runtime/delay", () => ({
  mockDelay: jest.fn(() => Promise.resolve()),
}));

jest.mock("@/mocks/repositories/users.repository", () => ({
  usersRepository: {
    getByLogin: jest.fn(),
    create: jest.fn(),
  },
}));

const usersRepositoryMock = usersRepository as jest.Mocked<
  typeof usersRepository
>;

describe("mockAuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns user-scoped token on successful login", async () => {
    usersRepositoryMock.getByLogin.mockReturnValue({ password: "user1" });

    const token = await mockAuthService.login({
      login: "user",
      password: "user1",
    });

    expect(token).toBe("mock:user");
    expect(usersRepositoryMock.getByLogin).toHaveBeenCalledWith("user");
  });

  it("returns empty string when login payload is invalid", async () => {
    const token = await mockAuthService.login({ login: "", password: "" });

    expect(token).toBe("");
    expect(usersRepositoryMock.getByLogin).not.toHaveBeenCalled();
  });

  it("returns empty string when credentials do not match", async () => {
    usersRepositoryMock.getByLogin.mockReturnValue({ password: "other" });

    const token = await mockAuthService.login({
      login: "user",
      password: "user1",
    });

    expect(token).toBe("");
  });

  it("returns user-scoped token on register", async () => {
    usersRepositoryMock.create.mockReturnValue(true);

    const token = await mockAuthService.register({
      login: "new-user",
      password: "ab",
      repeatPassword: "ab",
    });

    expect(token).toBe("mock:new-user");
    expect(usersRepositoryMock.create).toHaveBeenCalledWith("new-user", "ab");
  });

  it("returns empty string when register payload is invalid", async () => {
    const token = await mockAuthService.register({
      login: "new-user",
      password: "ab",
      repeatPassword: "xx",
    });

    expect(token).toBe("");
    expect(usersRepositoryMock.create).not.toHaveBeenCalled();
  });

  it("returns empty string when user already exists", async () => {
    usersRepositoryMock.create.mockReturnValue(false);

    const token = await mockAuthService.register({
      login: "existing",
      password: "ab",
      repeatPassword: "ab",
    });

    expect(token).toBe("");
  });
});
