import { endSession } from "@/lib/auth/session";
import { route } from "@/lib/http/handler";
import { noContent } from "@/lib/http/responses";

// No database needed: signing out must work even during an outage.
export const POST = route(
  async () => {
    await endSession();
    return noContent();
  },
  { db: false },
);
