import { getUser } from "@/controllers/auth/user.controller";
import { asynchandler } from "@/lib/api/asyncHandler";
import { rateLimiter } from "@/lib/helpers/rate-limiter";
import { db } from "@/lib/db-config/db";
import { NextRequest, NextResponse } from "next/server";

const handler = asynchandler(getUser);

export const GET = async (req: NextRequest) => {
  try {
    await db;

    // Get client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "127.0.0.1";

    // Rate limiter config
    const options = {
      keyPrefix: "getUser",
      limit: 5,    // max 5 requests
      ttl: 60,    // 5 minutes
    };

    const { allowed, remaining, reset } = await rateLimiter(ip, options);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Try again in ${reset} seconds.`,
        },
        { status: 429 }
      );
    }

    // Call handler
    const response = await handler(req);
     return response;

  } catch (err: any) {
    console.error("getUser route error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
};
