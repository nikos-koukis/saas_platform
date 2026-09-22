import type { Types } from "mongoose";

import type { ProjectStatus } from "@/models/Project";

/**
 * Wire formats live here rather than on the schemas, so the API contract
 * stays explicit and independent of how documents are stored.
 */
export type UserDto = {
  id: string;
  name: string;
  email: string;
};

export type TeamMemberDto = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type ProjectDto = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  deadline: string;
  budget: number;
  assignee: TeamMemberDto | null;
  createdAt: string;
  updatedAt: string;
};

type WithId = { _id: Types.ObjectId | string };

export function serializeUser(user: WithId & { name: string; email: string }): UserDto {
  return { id: String(user._id), name: user.name, email: user.email };
}

export function serializeTeamMember(
  member: WithId & { name: string; email: string; role: string },
): TeamMemberDto {
  return {
    id: String(member._id),
    name: member.name,
    email: member.email,
    role: member.role,
  };
}

type ProjectSource = WithId & {
  name: string;
  description?: string | null;
  status: ProjectStatus;
  deadline: Date;
  budget: number;
  assignee: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeProject(project: ProjectSource): ProjectDto {
  return {
    id: String(project._id),
    name: project.name,
    description: project.description ?? "",
    status: project.status,
    deadline: project.deadline.toISOString(),
    budget: project.budget,
    assignee: serializeAssignee(project.assignee),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

/**
 * `assignee` arrives as a populated document, a bare ObjectId when populate
 * was skipped, or null when the referenced member has since been removed.
 */
function serializeAssignee(value: unknown): TeamMemberDto | null {
  if (!value || typeof value !== "object" || !("name" in value)) return null;
  return serializeTeamMember(value as Parameters<typeof serializeTeamMember>[0]);
}
