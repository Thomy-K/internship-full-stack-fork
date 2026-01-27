import { emitAuthChanged } from "@/lib/authEvents";

const KEY = "access_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setToken(token: string) {
  localStorage.setItem(KEY, token);
  emitAuthChanged();
}

export function clearToken() {
  localStorage.removeItem(KEY);
  emitAuthChanged();
}

export function isLoggedIn() {
  return !!getToken();
}
