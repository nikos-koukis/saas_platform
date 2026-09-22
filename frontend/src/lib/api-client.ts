import type { PageMeta } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type FieldErrors = Record<string, string[] | undefined>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthenticated() {
    return this.status === 401;
  }
}

export type Envelope<T> = { data: T; meta?: PageMeta };

async function request<T>(path: string, init: RequestInit = {}): Promise<Envelope<T>> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      ...init,
      // The session cookie belongs to the API origin, not this one.
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Could not reach the server. Is the API running?");
  }

  if (response.status === 204) return { data: undefined as T };

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN",
      error?.message ?? "Something went wrong.",
      error?.details,
    );
  }

  return payload as Envelope<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: "DELETE" }),
};

/** SWR fetcher for endpoints that return a bare object. */
export const fetcher = <T>(path: string) => api.get<T>(path).then((envelope) => envelope.data);

/** SWR fetcher for list endpoints, keeping the pagination metadata. */
export const listFetcher = <T>(path: string) => api.get<T[]>(path);
