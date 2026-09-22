import { Pencil, Trash2 } from "lucide-react";

import type { Project } from "@/lib/types";

type Props = {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
};

export function RowActions({ project, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(project)}
        aria-label={`Edit ${project.name}`}
        className="rounded-lg p-2 text-muted transition-colors hover:bg-canvas hover:text-ink"
      >
        <Pencil className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onDelete(project)}
        aria-label={`Delete ${project.name}`}
        className="rounded-lg p-2 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}
