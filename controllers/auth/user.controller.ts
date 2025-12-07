import { NextRequest } from "next/server";
import Investor from "@models/inevstor.model";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { sanitizeUser } from "@/lib/helpers/sanitizer.user";
import { redis } from "@lib/db-config/db";

export const getUser = async (req: NextRequest) => {
  try {
    const userId = req.headers.get("x-temp-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const redisKey = `user:${userId}`;

    // 1️⃣ Try Redis
    const cachedUser = await redis.get(redisKey);

    if (cachedUser) {
      console.log("⚡ Served from Redis");

      // ✅ Ensure it is a string before parsing
      let userObj;
      try {
        userObj =
          typeof cachedUser === "string" ? JSON.parse(cachedUser) : cachedUser;
      } catch (err) {
        console.error("Failed to parse cached user:", err);
        userObj = cachedUser; // fallback
      }

      return new ApiResponse(200, userObj, "User fetched from Redis");
    }

    // 2️⃣ Fetch from DB
    const user = await Investor.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const sanitizedUser = sanitizeUser(user);

    // 3️⃣ Save in Redis permanently
    await redis.set(redisKey, JSON.stringify(sanitizedUser));

    console.log("Cached user permanently (until update)");

    return new ApiResponse(
      200,
      sanitizedUser,
      "User fetched from DB and cached"
    );
  } catch (err: any) {
    throw new ApiError(err.statusCode || 500, err.message || "Server error");
  }
};
