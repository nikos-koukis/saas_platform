"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { api, ApiError } from "@/lib/api-client";
import { PROJECT_STATUSES, STATUS_LABELS, type Project } from "@/lib/types";
import {
  projectFormSchema,
  type ProjectFormInput,
  type ProjectFormValues,
} from "@/lib/validation";

type Props = {
  /** The project being edited, or null to create a new one. */
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
};

function toFormValues(project: Project | null): ProjectFormInput {
  if (!project) {
    return { name: "", description: "", status: "active", deadline: "", assignee: "", budget: "" };
  }

  return {
    name: project.name,
    description: project.description,
    status: project.status,
    // <input type="date"> wants YYYY-MM-DD, and deadlines are stored at UTC
    // midnight, so the date part of the ISO string is already correct.
    deadline: project.deadline.slice(0, 10),
    assignee: project.assignee?.id ?? "",
    budget: String(project.budget),
  };
}

export function ProjectFormModal({ project, onClose, onSaved }: Props) {
  const isEdit = Boolean(project);
  const { members, isLoading: loadingMembers } = useTeamMembers();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput, unknown, ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: toFormValues(project),
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (project) await api.patch(`/projects/${project.id}`, values);
      else await api.post("/projects", values);

      onSaved();
      onClose();
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;

      for (const [field, messages] of Object.entries(error.fieldErrors ?? {})) {
        if (messages?.[0]) setError(field as keyof ProjectFormInput, { message: messages[0] });
      }
      setFormError(error.message);
    }
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? "Edit project" : "New project"}
      description={isEdit ? project?.name : "Add a project to the workspace."}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {formError && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            {formError}
          </p>
        )}

        <Field label="Name" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            placeholder="Atlas Billing Migration"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

        <Field label="Description" htmlFor="description" error={errors.description?.message}>
          <Textarea
            id="description"
            rows={3}
            placeholder="What is this project meant to achieve?"
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status" htmlFor="status" error={errors.status?.message}>
            <Select id="status" aria-invalid={Boolean(errors.status)} {...register("status")}>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Deadline" htmlFor="deadline" error={errors.deadline?.message}>
            <Input
              id="deadline"
              type="date"
              aria-invalid={Boolean(errors.deadline)}
              {...register("deadline")}
            />
          </Field>

          <Field label="Assigned to" htmlFor="assignee" error={errors.assignee?.message}>
            <Select
              id="assignee"
              disabled={loadingMembers}
              aria-invalid={Boolean(errors.assignee)}
              {...register("assignee")}
            >
              <option value="">{loadingMembers ? "Loading team…" : "Select a member"}</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} — {member.role}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Budget"
            htmlFor="budget"
            error={errors.budget?.message}
            hint="Whole euros"
          >
            <Input
              id="budget"
              type="number"
              min={0}
              step={500}
              inputMode="numeric"
              placeholder="50000"
              aria-invalid={Boolean(errors.budget)}
              {...register("budget")}
            />
          </Field>
        </div>

        <footer className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save changes" : "Create project"}
          </Button>
        </footer>
      </form>
    </Modal>
  );
}
