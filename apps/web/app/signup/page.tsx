"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    try {
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/login");
    } catch {
      setErr("No se pudo crear el usuario. Puede que el email ya exista.");
    }
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>Signup</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        <button type="submit">Create account</button>
      </form>

      {err && <p>{err}</p>}
    </main>
  );
}
