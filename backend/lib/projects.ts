import type { QueryFilter } from "mongoose";

import { badRequest, notFound, unprocessable } from "@/lib/http/errors";
import { objectIdSchema } from "@/lib/validation/common";
import type { ProjectQuery } from "@/lib/validation/project";
import { Project, type ProjectAttrs } from "@/models/Project";
import { TeamMember } from "@/models/TeamMember";

/** User input reaches a RegExp here, so metacharacters must lose their meaning. */
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function buildProjectFilter({
  status,
  assignee,
  search,
}: ProjectQuery): Promise<QueryFilter<ProjectAttrs>> {
  const filter: QueryFilter<ProjectAttrs> = {};

  if (status) filter.status = status;
  if (assignee) filter.assignee = assignee;

  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    // The roster is searched too, so typing a colleague's name finds their work.
    const matches = await TeamMember.find({ name: pattern }).select("_id").lean();

    filter.$or = [
      { name: pattern },
      { description: pattern },
      ...(matches.length ? [{ assignee: { $in: matches.map((member) => member._id) } }] : []),
    ];
  }

  return filter;
}

export function parseProjectId(raw: string): string {
  const result = objectIdSchema.safeParse(raw);
  if (!result.success) throw badRequest(`"${raw}" is not a valid project id.`);
  return result.data;
}

/** Rejects a write that would point a project at a team member who does not exist. */
export async function assertAssigneeExists(id: string | undefined): Promise<void> {
  if (!id) return;
  if (!(await TeamMember.exists({ _id: id }))) {
    throw unprocessable("Some fields need attention.", {
      assignee: ["That team member no longer exists"],
    });
  }
}

export async function findProjectOrThrow(id: string) {
  const project = await Project.findById(id).populate("assignee").lean();
  if (!project) throw notFound("Project not found.");
  return project;
}
