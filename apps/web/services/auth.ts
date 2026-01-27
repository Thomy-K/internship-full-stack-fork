import { apiFetch } from "@/lib/api";
import { clearToken, setToken } from "@/lib/auth";

export type MeResponse = { id: string; email: string };
export type LoginResponse = { access_token: string };

export async function signup(email: string, password: string) {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string) {
  const data = await apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}

export async function me(): Promise<MeResponse> {
  return apiFetch("/api/auth/me");
}

export function logout() {
  clearToken();
}
