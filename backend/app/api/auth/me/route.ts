import { endSession } from "@/lib/auth/session";
import { unauthorized } from "@/lib/http/errors";
import { authedRoute } from "@/lib/http/handler";
import { ok } from "@/lib/http/responses";
import { serializeUser } from "@/lib/serializers";
import { User } from "@/models/User";

export const GET = authedRoute(async (_request, _context, session) => {
  const user = await User.findById(session.userId).lean();

  // The token is valid but the account is gone; drop the stale cookie.
  if (!user) {
    await endSession();
    throw unauthorized("Your session is no longer valid.");
  }

  return ok(serializeUser(user));
});
