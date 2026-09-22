"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/api-client";
import type { TeamMember } from "@/lib/types";

/** The roster changes rarely, so the cached copy is reused across modals. */
export function useTeamMembers() {
  const { data, error, isLoading } = useSWR<TeamMember[]>("/team-members", fetcher, {
    revalidateOnFocus: false,
  });

  return { members: data ?? [], error, isLoading };
}
