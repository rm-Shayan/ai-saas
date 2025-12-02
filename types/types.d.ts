// types/global.d.ts
import type mongoose from "mongoose";
import type { Redis } from "@upstash/redis";

declare global {
  // Cache mongoose connection to avoid multiple connections during HMR
  // eslint-disable-next-line no-var
  var _mongooseConnection: Promise<typeof mongoose> | undefined;

  // Cache Upstash Redis client globally
  // eslint-disable-next-line no-var
  var _redisClient: Redis | undefined;
}

// This file must be a module
export {};
