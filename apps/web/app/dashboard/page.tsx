"use client";

import { useEffect, useState } from "react";
import Protected from "../../components/Protected";
import { apiFetch } from "../../lib/api";
import { clearToken } from "../../lib/auth";
import { useRouter } from "next/navigation";

type MeResponse = { id: string; email: string };

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((u) => setMe(u))
      .catch(() => setErr("No autorizado. Vuelve a iniciar sesión."));
  }, []);

  function logout() {
    clearToken();
    router.push("/login");
  }

  return (
    <Protected>
      <main style={{ padding: 16 }}>
        <h1>Dashboard</h1>

        {me && <p>Email: {me.email}</p>}
        {err && <p>{err}</p>}

        <button onClick={logout} style={{ marginTop: 12 }}>
          Logout
        </button>
      </main>
    </Protected>
  );
}
