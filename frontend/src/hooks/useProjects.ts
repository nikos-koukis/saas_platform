"use client";

import useSWR from "swr";

import { listFetcher, type Envelope } from "@/lib/api-client";
import type { Project } from "@/lib/types";
import type { ProjectFilters } from "./useProjectFilters";

export const PAGE_SIZE = 10;

function toQueryString({ status, search, sort, order, page }: ProjectFilters): string {
  const params = new URLSearchParams({
    sort,
    order,
    page: String(page),
    limit: String(PAGE_SIZE),
  });

  if (status !== "all") params.set("status", status);
  if (search) params.set("search", search);

  return params.toString();
}

export function useProjects(filters: ProjectFilters) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Envelope<Project[]>>(
    `/projects?${toQueryString(filters)}`,
    listFetcher,
    // Holding the previous page on screen while the next one loads stops the
    // table collapsing to a spinner on every keystroke.
    { keepPreviousData: true },
  );

  return {
    projects: data?.data ?? [],
    meta: data?.meta,
    error,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    refresh: mutate,
  };
}
