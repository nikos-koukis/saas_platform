"use client";

import { FolderOpen, Plus, SearchX } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useProjectFilters } from "@/hooks/useProjectFilters";
import { useProjects } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { cn } from "@/lib/cn";
import type { Project } from "@/lib/types";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { Pagination } from "./Pagination";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectFormModal } from "./ProjectFormModal";
import { ProjectsTable } from "./ProjectsTable";

export function ProjectsView() {
  const { filters, apply, toggleSort, isFiltered } = useProjectFilters();
  const { projects, meta, error, isLoading, isRefreshing, refresh } = useProjects(filters);

  // Warm the roster here so the assignee picker is populated the instant the
  // form opens; SWR dedupes, so the modal reads it straight from cache.
  useTeamMembers();

  // `editing` holds the project being changed; null means "create a new one".
  const [editing, setEditing] = useState<Project | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-muted">
            {meta ? `${meta.total} in total` : "Loading your workspace"}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden />
          New project
        </Button>
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
                : "Add your first project to get started."
            }
            action={
              !isFiltered && (
                <Button onClick={openCreate}>
                  <Plus className="size-4" aria-hidden />
                  New project
                </Button>
              )
            }
          />
        ) : (
          <>
            <ProjectsTable
              projects={projects}
              filters={filters}
              onSort={toggleSort}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
            {meta && meta.totalPages > 1 && (
              <Pagination meta={meta} onPageChange={(page) => apply({ page })} />
            )}
          </>
        )}
      </section>

      {/* Keyed so switching between projects rebuilds the form with fresh defaults. */}
      {isFormOpen && (
        <ProjectFormModal
          key={editing?.id ?? "new"}
          project={editing}
          onClose={() => setFormOpen(false)}
          onSaved={refresh}
        />
      )}

      {deleting && (
        <DeleteProjectDialog
          project={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={refresh}
        />
      )}
    </div>
  );
}
