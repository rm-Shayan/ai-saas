
import { deleteUser } from "@/controllers/auth/deleteAccount.controller";
import { asynchandler } from "@/lib/api/asyncHandler";
import { rateLimiter } from "@/lib/helpers/rate-limiter";
import { db } from "@/lib/db-config/db";
import { NextRequest, NextResponse } from "next/server";

const handler = asynchandler(deleteUser);

export const DELETE = async (req: NextRequest) => {
  try {
    await db;

    // Get client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "127.0.0.1";

    // Rate limiter config
    const options = {
      keyPrefix: "deleteUser",
      limit: 2,    // max 2 requests per TTL
      ttl: 60*60*6, // 6 hours
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
    return await handler(req);

  } catch (err: any) {
    console.error("deleteUser route error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
};
