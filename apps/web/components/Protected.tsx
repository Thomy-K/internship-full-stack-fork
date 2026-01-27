"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

function subscribeToken(cb: () => void) {
  // Re-render on:
  // - other tabs updating localStorage (storage event)
  // - this tab updating token (we dispatch custom event in setToken/clearToken)
  const onStorage = () => cb();
  const onAuth = () => cb();

  window.addEventListener("storage", onStorage);
  window.addEventListener("auth:changed", onAuth);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("auth:changed", onAuth);
  };
}

function getTokenSnapshot() {
  return getToken() ?? "";
}

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const token = useSyncExternalStore(
    subscribeToken,
    getTokenSnapshot,
    () => ""
  );

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <p className="text-sm text-muted-foreground">Checking session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
