import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "is required"),
  JWT_SECRET: z.string().min(32, "must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGIN: z.url().default("http://localhost:3000"),
  // Only needed when the API and UI live on different subdomains of one site.
  COOKIE_DOMAIN: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/**
 * Reads and validates configuration on first use rather than at import time,
 * so `next build` does not require a populated environment.
 */
export function env(): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".")} ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  cached = parsed.data;
  return cached;
}

export const isProduction = () => env().NODE_ENV === "production";
