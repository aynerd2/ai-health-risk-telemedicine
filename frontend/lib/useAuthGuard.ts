"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, UserRole } from "@/lib/api";

/**
 * Client-side route guard: redirects to /login if no token is present, or to
 * the caller's own dashboard if the logged-in role doesn't match. Real
 * authorization still happens on the backend (every endpoint checks the JWT
 * role) — this only avoids flashing a protected page at the wrong user.
 */
export function useAuthGuard(requiredRole: UserRole): { ready: boolean } {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!api.isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const role = api.getRole();
    if (role !== requiredRole) {
      router.replace(role ? `/${role}/dashboard` : "/login");
      return;
    }
    setReady(true);
  }, [requiredRole, router]);

  return { ready };
}
