import { authStorage } from "@/contexts/auth/authStorage";
import { getMockLoginFromToken } from "@/contexts/auth/authMock";

describe("getMockLoginFromToken", () => {
  afterEach(() => {
    authStorage.write(null);
  });

  it("returns login from new mock token format", () => {
    authStorage.write({
      accessToken: "mock:john",
      user: { login: "john" },
    });

    expect(getMockLoginFromToken()).toBe("john");
  });

  it("falls back to session login for old token format", () => {
    authStorage.write({
      accessToken: "mock-token",
      user: { login: "legacy-user" },
    });

    expect(getMockLoginFromToken()).toBe("legacy-user");
  });
});
