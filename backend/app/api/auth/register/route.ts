import { hashPassword } from "@/lib/auth/password";
import { startSession } from "@/lib/auth/session";
import { conflict } from "@/lib/http/errors";
import { route } from "@/lib/http/handler";
import { parseBody } from "@/lib/http/request";
import { created } from "@/lib/http/responses";
import { serializeUser } from "@/lib/serializers";
import { registerSchema } from "@/lib/validation/auth";
import { User } from "@/models/User";

export const POST = route(async (request) => {
  const { name, email, password } = await parseBody(request, registerSchema);

  if (await User.exists({ email })) {
    throw conflict("That email is already registered.");
  }

  const user = await User.create({ name, email, passwordHash: await hashPassword(password) });
  await startSession({ userId: String(user._id), email: user.email, name: user.name });

  return created(serializeUser(user));
});
