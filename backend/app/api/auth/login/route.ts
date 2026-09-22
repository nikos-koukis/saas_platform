import { verifyPassword } from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";
import { HttpError } from "@/lib/http/errors";
import { route } from "@/lib/http/handler";
import { parseBody } from "@/lib/http/request";
import { ok } from "@/lib/http/responses";
import { serializeUser } from "@/lib/serializers";
import { loginSchema } from "@/lib/validation/auth";
import { User } from "@/models/User";

export const POST = route(async (request) => {
  const { email, password } = await parseBody(request, loginSchema);

  const user = await User.findOne({ email }).select("+passwordHash");
  const passwordMatches = await verifyPassword(password, user?.passwordHash);

  // One message for both failures, so the response cannot be used to
  // discover which email addresses have accounts.
  if (!user || !passwordMatches) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  await startSession({ userId: String(user._id), email: user.email, name: user.name });

  return ok(serializeUser(user));
});
