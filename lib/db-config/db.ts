import mongoose from "mongoose";
import { Redis } from "@upstash/redis";

// ------------------------------
// 🔹 Validate ENV variables
// ------------------------------
if (!process.env.MONGODB_URI) throw new Error("❌ Missing MONGODB_URI in .env.local");
if (!process.env.UPSTASH_REDIS_REST_URL) throw new Error("❌ Missing UPSTASH_REDIS_REST_URL");
if (!process.env.UPSTASH_REDIS_REST_TOKEN) throw new Error("❌ Missing UPSTASH_REDIS_REST_TOKEN");

// ------------------------------
// 🔹 Mongoose Global Connection
// ------------------------------
let mongoConnection: Promise<typeof mongoose>;

const initMongoose = async () => {
  return mongoose.connect(process.env.MONGODB_URI!, {
    // future options can be added here
  });
};

if (process.env.NODE_ENV === "development") {
  // Use global cache to prevent multiple connections during hot reload
  if (!global._mongooseConnection) {
    global._mongooseConnection = initMongoose();
  }
  mongoConnection = global._mongooseConnection;
} else {
  mongoConnection = initMongoose();
}

// ------------------------------
// 🔹 Upstash Redis Client
// ------------------------------
let redisClient: Redis;

const initRedis = () =>
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

if (process.env.NODE_ENV === "development") {
  if (!global._redisClient) {
    global._redisClient = initRedis();
  }
  redisClient = global._redisClient;
} else {
  redisClient = initRedis();
}

// ------------------------------
// 📤 Exports
// ------------------------------
export const db = mongoConnection; // await db to ensure mongoose connected
export const redis = redisClient;
