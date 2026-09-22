"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/providers/auth-provider";

/**
 * The authoritative guard: it trusts the API's answer rather than the presence
 * of a cookie. proxy.ts handles the same redirect earlier to avoid a flash,
 * but cannot verify a signature, so this check still has to happen.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Spinner label="Checking your session" />
      </div>
    );
  }

  return <>{children}</>;
}
