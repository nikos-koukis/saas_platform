import { connectToDatabase } from "@/lib/db";
import { route } from "@/lib/http/handler";
import { ok } from "@/lib/http/responses";

// Never opens its own transaction and never fails: a probe that 500s when the
// database is down tells you less than one that reports the database is down.
export const GET = route(
  async () => {
    let database: "connected" | "unreachable" = "unreachable";
    try {
      await connectToDatabase();
      database = "connected";
    } catch {
      // Reported in the payload below.
    }

    return ok({
      status: database === "connected" ? "ok" : "degraded",
      database,
      uptime: Math.round(process.uptime()),
    });
  },
  { db: false },
);
