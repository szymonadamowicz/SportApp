import { RequestOptions } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function httpClient<T>(
  url: string,
  options?: RequestOptions
): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options?.body
      ? JSON.stringify(options.body)
      : undefined,
  });

  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }

  return res.json() as Promise<T>;
}
