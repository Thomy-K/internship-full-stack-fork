"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { onAuthChanged } from "@/lib/authEvents";

export function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const update = () => setLoggedIn(!!getToken());
    update();
    return onAuthChanged(update);
  }, []);

  return { loggedIn };
}
