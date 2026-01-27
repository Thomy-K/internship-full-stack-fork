"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

type Status = "checking" | "allowed";

export default function PublicOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace("/dashboard");
      return;
    }
    setStatus("allowed");
  }, [router]);

  if (status !== "allowed") return null;

  return <>{children}</>;
}
