import { authedRoute } from "@/lib/http/handler";
import { ok } from "@/lib/http/responses";
import { serializeTeamMember } from "@/lib/serializers";
import { TeamMember } from "@/models/TeamMember";

/** GET /api/team-members — populates the assignee picker in the project form. */
export const GET = authedRoute(async () => {
  const members = await TeamMember.find().sort({ name: 1 }).lean();
  return ok(members.map(serializeTeamMember));
});
