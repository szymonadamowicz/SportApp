import { RequestOptions } from "@/types/api";
import { authStorage } from "@/contexts/auth/authStorage";
import { API_BASE_URL } from "./env";

const BASE_URL = API_BASE_URL;

export async function httpClient<T>(
  url: string,
  options?: RequestOptions,
): Promise<T> {
  const session = authStorage.read();
  const token = session?.accessToken;

  // Avoid sending Authorization header for auth endpoints (login/register).
  // This prevents accidental use of stale tokens during registration/login flows.
  const shouldSendAuth = token && !url.startsWith("/auth");

  const res = await fetch(`${BASE_URL}${url}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(shouldSendAuth ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();

  if (!res.ok) {
    const safeText = text.trim();
    const canShowServerText =
      safeText.length > 0 &&
      safeText.length <= 220 &&
      !safeText.includes("Exception") &&
      !safeText.includes(" at ");

    throw new Error(
      canShowServerText
        ? `HTTP ${res.status}: ${safeText}`
        : `HTTP ${res.status}: Request failed.`,
    );
  }

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
