"use client";

import { FolderOpen, SearchX } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useProjectFilters } from "@/hooks/useProjectFilters";
import { useProjects } from "@/hooks/useProjects";
import { cn } from "@/lib/cn";
import { Pagination } from "./Pagination";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectsTable } from "./ProjectsTable";

export function ProjectsView() {
  const { filters, apply, toggleSort, isFiltered } = useProjectFilters();
  const { projects, meta, error, isLoading, isRefreshing } = useProjects(filters);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="mt-1 text-sm text-muted">
          {meta ? `${meta.total} in total` : "Loading your workspace"}
        </p>
      </header>

      <ProjectFilters filters={filters} onChange={apply} />

      <section
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-surface transition-opacity",
          // Dim rather than unmount, so the table does not jump while refetching.
          isRefreshing && "opacity-60",
        )}
      >
        {error ? (
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="Could not load projects"
            description={error.message}
          />
        ) : isLoading ? (
          <div className="grid place-items-center py-20">
            <Spinner label="Loading projects" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={isFiltered ? <SearchX className="size-5" /> : <FolderOpen className="size-5" />}
            title={isFiltered ? "No projects match those filters" : "No projects yet"}
            description={
              isFiltered
                ? "Try a different search term or status."
                : "Seed the database or add your first project."
            }
          />
        ) : (
          <>
            <ProjectsTable projects={projects} filters={filters} onSort={toggleSort} />
            {meta && meta.totalPages > 1 && (
              <Pagination meta={meta} onPageChange={(page) => apply({ page })} />
            )}
          </>
        )}
      </section>
    </div>
  );
}
