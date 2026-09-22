"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export type SortColumn = "name" | "status" | "deadline" | "budget";

export type ProjectFilters = {
  status: string;
  search: string;
  sort: SortColumn;
  order: "asc" | "desc";
  page: number;
};

const DEFAULTS: ProjectFilters = {
  status: "all",
  search: "",
  sort: "deadline",
  order: "asc",
  page: 1,
};

/**
 * Filters live in the URL rather than component state, so a filtered view can
 * be bookmarked, shared and restored by the back button.
 */
export function useProjectFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<ProjectFilters>(
    () => ({
      status: searchParams.get("status") ?? DEFAULTS.status,
      search: searchParams.get("search") ?? DEFAULTS.search,
      sort: (searchParams.get("sort") as SortColumn) ?? DEFAULTS.sort,
      order: searchParams.get("order") === "desc" ? "desc" : "asc",
      page: Math.max(1, Number(searchParams.get("page")) || DEFAULTS.page),
    }),
    [searchParams],
  );

  const apply = useCallback(
    (patch: Partial<ProjectFilters>) => {
      // Narrowing the result set invalidates the current page number.
      const resetsPage = "status" in patch || "search" in patch || "sort" in patch;
      const next = { ...filters, ...patch, ...(resetsPage && !patch.page ? { page: 1 } : {}) };

      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (String(value) !== String(DEFAULTS[key as keyof ProjectFilters])) {
          params.set(key, String(value));
        }
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  /** Clicking the active column flips direction; a new column starts ascending. */
  const toggleSort = useCallback(
    (column: SortColumn) =>
      apply({
        sort: column,
        order: filters.sort === column && filters.order === "asc" ? "desc" : "asc",
      }),
    [apply, filters.sort, filters.order],
  );

  const isFiltered = filters.status !== DEFAULTS.status || filters.search !== DEFAULTS.search;

  return { filters, apply, toggleSort, isFiltered };
}
