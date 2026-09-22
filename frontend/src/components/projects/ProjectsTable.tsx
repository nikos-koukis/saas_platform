"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ProjectFilters, SortColumn } from "@/hooks/useProjectFilters";
import { cn } from "@/lib/cn";
import { formatBudget } from "@/lib/format";
import type { Project } from "@/lib/types";
import { Assignee } from "./Assignee";
import { DeadlineCell } from "./DeadlineCell";

const COLUMNS: { key: SortColumn; label: string; numeric?: boolean }[] = [
  { key: "name", label: "Project" },
  { key: "status", label: "Status" },
  { key: "deadline", label: "Deadline" },
  { key: "budget", label: "Budget", numeric: true },
];

type Props = {
  projects: Project[];
  filters: ProjectFilters;
  onSort: (column: SortColumn) => void;
};

export function ProjectsTable({ projects, filters, onSort }: Props) {
  return (
    <>
      {/* Wide screens get a table; narrow ones get cards, because a five-column
          table on a phone is a horizontal scroll nobody enjoys. */}
      <table className="hidden w-full border-collapse text-sm md:table">
        <thead>
          <tr className="border-b border-border text-left">
            {COLUMNS.map(({ key, label, numeric }) => (
              <SortableHeader
                key={key}
                column={key}
                label={label}
                numeric={numeric}
                filters={filters}
                onSort={onSort}
              />
            ))}
            <th scope="col" className="px-4 py-3 font-medium text-muted">
              Assignee
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b border-border last:border-0 hover:bg-canvas/60">
              <td className="max-w-xs px-4 py-3">
                <p className="truncate font-medium text-ink">{project.name}</p>
                {project.description && (
                  <p className="truncate text-xs text-muted">{project.description}</p>
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={project.status} />
              </td>
              <td className="px-4 py-3">
                <DeadlineCell deadline={project.deadline} status={project.status} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-ink">
                {formatBudget(project.budget)}
              </td>
              <td className="w-56 px-4 py-3">
                <Assignee member={project.assignee} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-border md:hidden">
        {projects.map((project) => (
          <li key={project.id} className="flex flex-col gap-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{project.name}</p>
                {project.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">{project.description}</p>
                )}
              </div>
              <StatusBadge status={project.status} />
            </div>

            <div className="flex items-end justify-between gap-3">
              <Assignee member={project.assignee} />
              <div className="text-right">
                <p className="tabular-nums font-medium text-ink">{formatBudget(project.budget)}</p>
                <DeadlineCell deadline={project.deadline} status={project.status} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function SortableHeader({
  column,
  label,
  numeric,
  filters,
  onSort,
}: {
  column: SortColumn;
  label: string;
  numeric?: boolean;
  filters: ProjectFilters;
  onSort: (column: SortColumn) => void;
}) {
  const active = filters.sort === column;
  const Icon = !active ? ChevronsUpDown : filters.order === "asc" ? ArrowUp : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={active ? (filters.order === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-4 py-3 font-medium", numeric && "text-right")}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded transition-colors hover:text-ink",
          active ? "text-ink" : "text-muted",
          numeric && "flex-row-reverse",
        )}
      >
        {label}
        <Icon className="size-3.5" aria-hidden />
      </button>
    </th>
  );
}
