import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/controllers/auth/verify-otp.controller";
import { asynchandler } from "@/lib/api/asyncHandler";
import { rateLimiter } from "@/lib/helpers/rate-limiter";
import { db, redis } from "@/lib/db-config/db";

// Wrap controller with async handler
const handler = asynchandler(verifyOTP);

export const POST = async (req: NextRequest) => {
  try {
    // Wait for DB connection (mongoose)
    await db;

    // Redis already connected, no need to call
    // await redis;

    // Detect client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "anonymous";

    // Rate limiter options
    const options = {
      limit: 3,   // max  requests
      ttl: 60,    // per 60 seconds
      keyPrefix:"verify-otp"
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

    // Call verify OTP controller
    return await handler(req);
  } catch (err: any) {
    console.error("Verify OTP route error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
};
