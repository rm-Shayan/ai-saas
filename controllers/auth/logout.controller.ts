import { ApiResponse } from "@/lib/api/ApiResponse";
import { ApiError } from "@/lib/api/ApiError";
import Investor from "@models/inevstor.model";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/db-config/db";



// delete also user from redis cache and delete token cookies
export const logoutUser = async (req: NextRequest) => {
  try {
    // 1️⃣ Get userId from headers
    const userId = req.headers.get("x-temp-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    // Redis cache key
    const redisKey = `user:${userId}`;

    // 2️⃣ Remove user from database
    const deletedUser = await Investor.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new ApiError(404, "User not found");
    }

    // 3️⃣ Delete Redis cache
    await redis.del(redisKey);

    // 4️⃣ Remove cookies
    const deleteAccessCookie = [
      `accessToken=`,
      "HttpOnly",
      "Path=/",
      "Max-Age=0",
      "SameSite=Lax",
    ].join("; ");

    const deleteRefreshCookie = [
      `refreshToken=`,
      "HttpOnly",
      "Path=/",
      "Max-Age=0",
      "SameSite=Lax",
    ].join("; ");

    // 5️⃣ Create response
    const res = NextResponse.json(
      new ApiResponse(200, null, "User deleted successfully")
    );

    res.headers.append("Set-Cookie", deleteAccessCookie);
    res.headers.append("Set-Cookie", deleteRefreshCookie);

    return res;
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal Server Error",
      },
      { status: err.statusCode || 500 }
    );
  }
};
