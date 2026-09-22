import { authedRoute } from "@/lib/http/handler";
import { parseBody, parseQuery } from "@/lib/http/request";
import { created, ok } from "@/lib/http/responses";
import { assertAssigneeExists, buildProjectFilter, findProjectOrThrow } from "@/lib/projects";
import { serializeProject } from "@/lib/serializers";
import { createProjectSchema, projectQuerySchema } from "@/lib/validation/project";
import { Project } from "@/models/Project";

/** GET /api/projects — filter by status or assignee, search, sort, paginate. */
export const GET = authedRoute(async (request) => {
  const query = parseQuery(request, projectQuerySchema);
  const filter = await buildProjectFilter(query);
  const { sort, order, page, limit } = query;

  const [projects, total] = await Promise.all([
    Project.find(filter)
      // `_id` breaks ties so a record cannot shift between pages mid-scroll.
      .sort({ [sort]: order === "asc" ? 1 : -1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("assignee")
      .lean(),
    Project.countDocuments(filter),
  ]);

  return ok(projects.map(serializeProject), {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

/** POST /api/projects */
export const POST = authedRoute(async (request) => {
  const input = await parseBody(request, createProjectSchema);
  await assertAssigneeExists(input.assignee);

  const { _id } = await Project.create(input);

  return created(serializeProject(await findProjectOrThrow(String(_id))));
});
