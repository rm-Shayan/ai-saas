import { ApiResponse } from "@/lib/api/ApiResponse";
import { ApiError } from "@/lib/api/ApiError";
import Investor from "@models/inevstor.model";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/db-config/db";

export const logoutUser = async (req: NextRequest) => {
  try {
    const userId = req.headers.get("x-temp-user-id");

    if (userId) {
      // 1. Remove refresh token from DB (do NOT delete user account!)
      await Investor.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } }).catch(() => {});

      // 2. Clear Redis cache for user
      await redis.del(`user:${userId}`).catch(() => {});
    }

    // 3. Clear auth cookies
    const res = NextResponse.json(
      new ApiResponse(200, null, "Logged out successfully")
    );

    res.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 0,
    });

    res.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 0,
    });

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
