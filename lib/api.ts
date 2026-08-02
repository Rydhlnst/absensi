type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  cache?: RequestCache;
  revalidate?: number;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function buildUrl(path: string, params?: FetchOptions["params"]): string {
  if (!params) return path;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}

export async function api<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = "GET", body, params, cache, revalidate } = options;

  const url = buildUrl(path, params);

  const init: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  if (cache) {
    init.cache = cache;
  } else if (revalidate !== undefined) {
    (init as Record<string, unknown>).next = { revalidate };
  }

  const res = await fetch(url, init);

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      message = data?.error || data?.message || message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

export const apiClient = {
  get: <T = unknown>(path: string, params?: FetchOptions["params"]) =>
    api<T>(path, { method: "GET", params, cache: "no-store" }),

  post: <T = unknown>(path: string, body?: unknown) =>
    api<T>(path, { method: "POST", body }),

  put: <T = unknown>(path: string, body?: unknown) =>
    api<T>(path, { method: "PUT", body }),

  patch: <T = unknown>(path: string, body?: unknown) =>
    api<T>(path, { method: "PATCH", body }),

  delete: <T = unknown>(path: string) =>
    api<T>(path, { method: "DELETE" }),
};
