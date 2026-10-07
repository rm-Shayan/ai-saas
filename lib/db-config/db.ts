import mongoose from "mongoose";
import { Redis } from "@upstash/redis";

// ------------------------------
// Lazy env validation + lazy init.
// Nothing connects or throws at import time — this keeps
// `next build` page-data collection working without env,
// while the first real request still fails fast if envs are missing.
// ------------------------------
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`❌ Missing ${name} in environment`);
  return value;
}

const initMongoose = () => mongoose.connect(requireEnv("MONGODB_URI"));

function getMongo(): Promise<typeof mongoose> {
  if (!global._mongooseConnection) {
    global._mongooseConnection = initMongoose();
  }
  return global._mongooseConnection;
}

// Awaitable stand-in: starts the connection on first `await db`
export const db: Promise<typeof mongoose> = {
  then: ((onF?: any, onR?: any) => getMongo().then(onF, onR)) as any,
  catch: ((onR?: any) => getMongo().catch(onR)) as any,
  finally: ((onF?: any) => getMongo().finally(onF)) as any,
  [Symbol.toStringTag]: "Promise",
} as Promise<typeof mongoose>;

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      url: requireEnv("UPSTASH_REDIS_REST_URL"),
      token: requireEnv("UPSTASH_REDIS_REST_TOKEN"),
    });
  }
  return redisClient;
}

export const redis = new Proxy({} as Redis, {
  get: (_, prop) => {
    const client: any = getRedis();
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
