import { authStorage } from "@/contexts/auth/authStorage";

export function getMockLoginFromToken(): string {
  const session = authStorage.read();
  const token = session?.accessToken;

  if (!token) {
    throw new Error("Not authenticated");
  }

  if (!token.startsWith("mock")) {
    throw new Error("Invalid mock token");
  }

  if (token.startsWith("mock:")) {
    const login = token.slice("mock:".length).trim();
    if (!login) throw new Error("Invalid mock token payload");
    return login;
  }

  const loginFromSession = session?.user?.login?.trim();
  if (loginFromSession) return loginFromSession;

  throw new Error("Mock login could not be resolved");
}
