// app/api/auth/user/route.ts
import { updateUser } from "@/controllers/auth/userUpdate.controller";
import { asynchandler } from "@/lib/api/asyncHandler";
import { rateLimiter } from "@/lib/helpers/rate-limiter";
import { db } from "@/lib/db-config/db";
import { NextRequest, NextResponse } from "next/server";

const handler = asynchandler(updateUser);

export const PUT = async (req: NextRequest) => {
  try {
    // 1️⃣ Ensure DB connection
    await db;

    // 2️⃣ Get client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "127.0.0.1";

    // 3️⃣ Rate limiter config
    const options = {
    keyPrefix: "updateUser",
      limit: 3,          // max 3 requests
      ttl: 60 * 60 * 12, // 12 hours
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

    // 4️⃣ Call the updateUser controller
    const response = await handler(req);

    return response;

  } catch (err: any) {
    console.error("updateUser route error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
};
