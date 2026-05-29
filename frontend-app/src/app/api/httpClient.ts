import { RequestOptions } from "@/types/api";
import { authStorage } from "@/contexts/auth/authStorage";
import { API_BASE_URL } from "./env";
import {
  createApiErrorFromResponse,
  createNetworkError,
} from "./apiError";

const BASE_URL = API_BASE_URL;

export async function httpClient<T>(
  url: string,
  options?: RequestOptions,
): Promise<T> {
  const session = authStorage.read();
  const token = session?.accessToken;

  const shouldSendAuth = token && !url.startsWith("/auth");

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${url}`, {
      method: options?.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(shouldSendAuth ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw createNetworkError();
  }

  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) {
      authStorage.write(null);
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path !== "/" && path !== "/login") {
          window.location.replace("/login");
        }
      }
    }

    throw createApiErrorFromResponse(res, text);
  }

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
