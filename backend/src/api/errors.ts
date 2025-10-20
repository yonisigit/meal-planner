export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  if (!error || typeof error !== "object") {
    return false;
  }

  return "statusCode" in error && typeof (error as HttpError).statusCode === "number";
}

export function toHttpError(error: unknown, fallbackStatusCode = 500): HttpError {
  if (isHttpError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  if (error && typeof error === "object" && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    if (Number.isInteger(status) && status > 0) {
      return new HttpError(status, message);
    }
  }

  return new HttpError(fallbackStatusCode, message);
}
