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

  return token.replace("mock", "");
}
