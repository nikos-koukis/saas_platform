/** Mirrors the DTOs the API returns. Kept in sync by hand; see README. */

export const PROJECT_STATUSES = ["active", "on_hold", "completed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  deadline: string;
  budget: number;
  assignee: TeamMember | null;
  createdAt: string;
  updatedAt: string;
};

export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
