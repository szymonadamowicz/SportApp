import { RequestOptions } from "@/types/api";
import { authStorage } from "@/contexts/auth/authStorage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function httpClient<T>(
  url: string,
  options?: RequestOptions
): Promise<T> {
  const session = authStorage.read();
  const token = session?.accessToken;

  const res = await fetch(`${BASE_URL}${url}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return JSON.parse(text) as T;
}
