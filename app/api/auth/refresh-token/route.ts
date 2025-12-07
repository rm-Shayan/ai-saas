import { asynchandler } from "@/lib/api/asyncHandler";
import { refreshToken } from "@/controllers/auth/refreshToken.controller";
import { rateLimiter } from "@/lib/helpers/rate-limiter";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db-config/db";

// Wrap controller
const handler = asynchandler(refreshToken);

export const GET = async (req: NextRequest) => {
  try {
    // 1️⃣ Ensure DB connection
    await db;

    // 2️⃣ Get client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "127.0.0.1";

    // 3️⃣ Rate limiting
    const options = {
      keyPrefix: "refresh-token",
      limit: 5,
      ttl: 300, // 1 minute
    };

    const { allowed, reset } = await rateLimiter(ip, options);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many attempts. Try again in ${reset} seconds.`,
        },
        { status: 429 }
      );
    }

    // 4️⃣ Proceed to refresh token controller
    return await handler(req);

  } catch (err: any) {
    console.error("Refresh token route error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
