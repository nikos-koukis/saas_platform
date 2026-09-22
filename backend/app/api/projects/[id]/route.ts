import { notFound } from "@/lib/http/errors";
import { authedRoute } from "@/lib/http/handler";
import { parseBody } from "@/lib/http/request";
import { noContent, ok } from "@/lib/http/responses";
import { assertAssigneeExists, findProjectOrThrow, parseProjectId } from "@/lib/projects";
import { serializeProject } from "@/lib/serializers";
import { patchProjectSchema, replaceProjectSchema } from "@/lib/validation/project";
import { Project } from "@/models/Project";

type Params = { id: string };

/** GET /api/projects/:id */
export const GET = authedRoute<Params>(async (_request, { params }) => {
  const id = parseProjectId((await params).id);
  return ok(serializeProject(await findProjectOrThrow(id)));
});

/** PATCH /api/projects/:id — updates the fields provided. */
export const PATCH = authedRoute<Params>(async (request, { params }) => {
  const id = parseProjectId((await params).id);
  const input = await parseBody(request, patchProjectSchema);
  await assertAssigneeExists(input.assignee);

  return ok(serializeProject(await applyUpdate(id, input)));
});

/** PUT /api/projects/:id — replaces the record, so every field is required. */
export const PUT = authedRoute<Params>(async (request, { params }) => {
  const id = parseProjectId((await params).id);
  const input = await parseBody(request, replaceProjectSchema);
  await assertAssigneeExists(input.assignee);

  return ok(serializeProject(await applyUpdate(id, input)));
});

/** DELETE /api/projects/:id */
export const DELETE = authedRoute<Params>(async (_request, { params }) => {
  const id = parseProjectId((await params).id);

  if (!(await Project.findByIdAndDelete(id))) throw notFound("Project not found.");

  return noContent();
});

async function applyUpdate(id: string, input: Record<string, unknown>) {
  const updated = await Project.findByIdAndUpdate(id, input, {
    new: true,
    // Schema rules are not applied to updates unless asked for explicitly.
    runValidators: true,
  })
    .populate("assignee")
    .lean();

  if (!updated) throw notFound("Project not found.");
  return updated;
}
