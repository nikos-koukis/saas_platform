"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { api, ApiError } from "@/lib/api-client";
import type { Project } from "@/lib/types";

type Props = {
  project: Project;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteProjectDialog({ project, onClose, onDeleted }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/projects/${project.id}`);
      onDeleted();
      onClose();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not delete this project.");
      setDeleting(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Delete project" className="max-w-md">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          <span className="font-medium text-ink">{project.name}</span> will be removed permanently.
          This cannot be undone.
        </p>

        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <footer className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDelete} loading={deleting}>
            Delete
          </Button>
        </footer>
      </div>
    </Modal>
  );
}
