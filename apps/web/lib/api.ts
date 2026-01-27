import { getToken, clearToken } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export type ApiErrorDetail =
  | string
  | {
      code?: string;
      message?: string;
      hints?: string[];
    };

export class ApiError extends Error {
  status: number;
  detail: ApiErrorDetail;

  constructor(status: number, detail: ApiErrorDetail) {
    super(typeof detail === "string" ? detail : detail?.message ?? "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? getToken() : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // only set JSON header if we have a body
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  const payload = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    const detail = payload?.detail ?? payload ?? "Request failed";

    if (res.status === 401) {
      try {
        clearToken();
      } catch {}
    }

    throw new ApiError(res.status, detail);
  }

  return payload as T;
}
