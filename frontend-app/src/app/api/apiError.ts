export class ApiRequestError extends Error {
  status?: number;
  rawMessage?: string;

  constructor(
    message: string,
    options: { status?: number; rawMessage?: string } = {},
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options.status;
    this.rawMessage = options.rawMessage;
  }
}

const defaultMessage =
  "Something went wrong. Please try again in a moment.";

const statusMessages: Record<number, string> = {
  400: "Some information needs attention. Please check the form and try again.",
  401: "Your session expired. Please log in again.",
  403: "You do not have permission to do this.",
  404: "We could not find this item. Refresh and try again.",
  409: "This changed in the meantime. Refresh and try again.",
  413: "The uploaded file is too large.",
  415: "This file type is not supported.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "The server could not complete this action. Please try again.",
  502: "The server is temporarily unavailable. Please try again.",
  503: "The server is temporarily unavailable. Please try again.",
  504: "The server took too long to respond. Please try again.",
};

export function createApiErrorFromResponse(
  response: Response,
  bodyText: string,
  fallback = defaultMessage,
): ApiRequestError {
  const rawMessage = bodyText.trim();
  const safeMessage = getSafeServerMessage(rawMessage);
  const statusMessage = statusMessages[response.status];

  return new ApiRequestError(
    safeMessage ?? statusMessage ?? fallback,
    {
      status: response.status,
      rawMessage,
    },
  );
}

export function createNetworkError(fallback = defaultMessage) {
  return new ApiRequestError(
    fallback === defaultMessage
      ? "We could not reach the server. Check your connection and try again."
      : fallback,
  );
}

export function getFriendlyErrorMessage(
  error: unknown,
  fallback = defaultMessage,
): string {
  if (error instanceof ApiRequestError) {
    return error.message;
  }

  if (error instanceof Error) {
    const known = mapKnownTechnicalMessage(error.message);
    if (known) return known;

    const safe = getSafeServerMessage(error.message);
    if (safe) return safe;
  }

  return fallback;
}

function mapKnownTechnicalMessage(message: string): string | null {
  const normalized = message.trim();
  if (!normalized) return null;

  if (/^HTTP\s+\d+/i.test(normalized)) {
    return defaultMessage;
  }

  if (
    normalized.includes("Failed to fetch") ||
    normalized.includes("NetworkError") ||
    normalized.includes("Load failed")
  ) {
    return "We could not reach the server. Check your connection and try again.";
  }

  if (
    normalized.includes("Request failed") ||
    normalized.includes("Unexpected token") ||
    normalized.includes("JSON.parse")
  ) {
    return defaultMessage;
  }

  return null;
}

function getSafeServerMessage(message: string): string | null {
  const normalized = message.trim();
  if (!normalized || normalized.length > 180) return null;

  const technicalMarkers = [
    "Exception",
    " at ",
    "Microsoft.",
    "System.",
    "Npgsql",
    "DbUpdate",
    "stack",
    "<!DOCTYPE",
    "<html",
    "{",
    "}",
  ];

  if (technicalMarkers.some((marker) => normalized.includes(marker))) {
    return null;
  }

  return normalized;
}
