type ApiMode = "mock" | "real";

const DEFAULT_API_MODE: ApiMode = "real";

function getDefaultApiUrl(): string {
  if (typeof window !== "undefined") {
    return "http://localhost:5064/api";
  }

  if (process.env.NODE_ENV === "production") {
    return "http://backend:8080/api";
  }

  return "http://localhost:5064/api";
}

const DEFAULT_API_URL = getDefaultApiUrl();

function readEnv(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function readApiMode(value: string | undefined): ApiMode {
  return readEnv(value, DEFAULT_API_MODE).toLowerCase() === "mock"
    ? "mock"
    : "real";
}

export const API_MODE: ApiMode = readApiMode(process.env.NEXT_PUBLIC_API_MODE);
export const API_BASE_URL: string = readEnv(
  process.env.NEXT_PUBLIC_API_URL,
  DEFAULT_API_URL,
);
