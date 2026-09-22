"use client";

import { createContext, use, useCallback, useMemo, type ReactNode } from "react";
import useSWR from "swr";

import { api, fetcher } from "@/lib/api-client";
import type { User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The session cookie is httpOnly, so the only way to know who is signed in is
 * to ask the API. That answer is cached by SWR and shared across the tree.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, mutate } = useSWR<User>("/auth/me", fetcher, {
    // A 401 is a valid answer ("nobody is signed in"), not a transient failure.
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data: user } = await api.post<User>("/auth/login", { email, password });
      await mutate(user, { revalidate: false });
    },
    [mutate],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { data: user } = await api.post<User>("/auth/register", { name, email, password });
      await mutate(user, { revalidate: false });
    },
    [mutate],
  );

  const signOut = useCallback(async () => {
    await api.post("/auth/logout");
    await mutate(undefined, { revalidate: false });
  }, [mutate]);

  const value = useMemo(
    () => ({ user: data ?? null, isLoading, signIn, signUp, signOut }),
    [data, isLoading, signIn, signUp, signOut],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
