"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../lib/auth";

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = getToken();
  const [ok] = useState(!!token);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!ok) return null;
  return <>{children}</>;
}
