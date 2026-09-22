/** An error carrying the HTTP status and machine-readable code to send back. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, "BAD_REQUEST", message, details);

export const unauthorized = (message = "Sign in to continue.") =>
  new HttpError(401, "UNAUTHENTICATED", message);

export const notFound = (message = "Resource not found.") =>
  new HttpError(404, "NOT_FOUND", message);

export const conflict = (message: string) => new HttpError(409, "CONFLICT", message);

export const unprocessable = (message: string, details?: unknown) =>
  new HttpError(422, "VALIDATION_ERROR", message, details);
