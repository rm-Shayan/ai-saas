import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/lib/helpers/rate-limiter";
import { asynchandler } from "@/lib/api/asyncHandler";
import { loginUser } from "@/controllers/auth/login.controller";
import { db } from "@/lib/db-config/db";

// Wrap login controller
const handler = asynchandler(loginUser)

export const POST = async (req: NextRequest) => {
  try {
    // Connect DB
    await  db;

    // Client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "127.0.0.1";

    // Rate limiter (same style as signup)
    const options = {
      keyPrefix: "login", // important
      limit: 13,
      ttl: 300, // 5 minutes
    };

    const { allowed, reset } = await rateLimiter(ip, options);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many login attempts. Try again in ${reset} seconds.`,
        },
        { status: 429 }
      );
    }

    // Proceed with login
    return await handler(req);

  } catch (err: any) {
    console.error("Login route error:", err);

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
