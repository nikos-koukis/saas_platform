"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Select } from "@/components/ui/Select";
import { controlClasses } from "@/components/ui/Field";
import { useDebounce } from "@/hooks/useDebounce";
import type { ProjectFilters as Filters } from "@/hooks/useProjectFilters";
import { cn } from "@/lib/cn";
import { PROJECT_STATUSES, STATUS_LABELS } from "@/lib/types";

type Props = {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
};

export function ProjectFilters({ filters, onChange }: Props) {
  const [term, setTerm] = useState(filters.search);
  const [adopted, setAdopted] = useState(filters.search);
  const debounced = useDebounce(term, 300);

  // The URL moved without us — back button, or the Clear control. Adopt it
  // during render rather than in an effect, which would cost an extra pass.
  if (filters.search !== adopted) {
    setAdopted(filters.search);
    setTerm(filters.search);
  }

  // Only push once the debounce has caught up with what is actually typed.
  // Without that guard, adopting a new URL while an old term is still in
  // flight would write the old term straight back — clearing would not stick.
  useEffect(() => {
    if (debounced === term && debounced !== filters.search) onChange({ search: debounced });
  }, [debounced, term, filters.search, onChange]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search projects, descriptions or people"
          aria-label="Search projects"
          className={cn(controlClasses, "pl-9")}
        />
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          aria-label="Filter by status"
          className="w-full sm:w-44"
        >
          <option value="all">All statuses</option>
          {PROJECT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </Select>

        {(filters.search || filters.status !== "all") && (
          <button
            type="button"
            onClick={() => onChange({ search: "", status: "all" })}
            className="inline-flex h-10 shrink-0 items-center gap-1 rounded-lg px-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <X className="size-4" aria-hidden />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
