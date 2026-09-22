import mongoose from "mongoose";
import { env } from "./env";

type ConnectionCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Next.js re-evaluates modules on hot reload; caching on globalThis keeps a
// single connection pool instead of leaking one per rebuild.
const globalForMongoose = globalThis as typeof globalThis & {
  __mongooseCache?: ConnectionCache;
};

const cache: ConnectionCache = (globalForMongoose.__mongooseCache ??= {
  conn: null,
  promise: null,
});

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  cache.promise ??= mongoose
    .connect(env().MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
    })
    .catch((error: unknown) => {
      // Drop the rejected promise so the next request retries the connection.
      cache.promise = null;
      throw error;
    });

  cache.conn = await cache.promise;
  return cache.conn;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (!cache.conn) return;
  await mongoose.disconnect();
  cache.conn = null;
  cache.promise = null;
}
