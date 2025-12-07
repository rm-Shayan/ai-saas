// app/api/auth/forgot-password/route.ts
import { NextRequest } from "next/server";
import { rateLimiter } from "@/lib/helpers/rate-limiter";
import { asynchandler } from "@/lib/api/asyncHandler";
import { db, redis } from "@/lib/db-config/db";
import { forgotPassword } from "@/controllers/auth/forgotPassword.controller";

const handler = asynchandler(forgotPassword);

export const POST = async (req: NextRequest) => {
  try {
    // Ensure DB is connected
    await db;

    // Get client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "127.0.0.1";

    // Rate limiter config: max 3 requests per 5 minutes
    const options = {
      keyPrefix: "forgot-password",
      limit: 3,
      ttl: 300, // 5 minutes in seconds
    };

    const { allowed, remaining, reset } = await rateLimiter(ip, options);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Too many requests. Try again in ${reset} seconds.`,
        }),
        { status: 429 }
      );
    }

    // Call the controller via asyncHandler
    return await handler(req);
  } catch (err: any) {
    console.error("Forgot Password route error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        message: err.message || "Internal Server Error",
      }),
      { status: 500 }
    );
  }
};
