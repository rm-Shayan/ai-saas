
// app/api/auth/reset-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { asynchandler } from "@/lib/api/asyncHandler";
import { rateLimiter } from "@/lib/helpers/rate-limiter";
import { resetOTP } from "@/controllers/auth/regenerate-otp.controller";
import { db } from "@/lib/db-config/db";

const handler = asynchandler(resetOTP);

export const POST = async (req: NextRequest) => {
  try {
    await db;
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "anonymous";

    // ✓ COOL-DOWN via middleware
    const rules = [
      { limit: 1, ttl: 1, prefix: "otp-1sec" },         // 1 req / 1 second
      { limit: 1, ttl: 30, prefix: "otp-30sec" },       // next allowed after 30s
      { limit: 3, ttl: 1800, prefix: "otp-30min" },     // 3 req / 30 minutes
      { limit: 8, ttl: 86400, prefix: "otp-24hr" }      // 8 req / 24 hours
    ];

    for (const rule of rules) {
      const { allowed, reset } = await rateLimiter(`${rule.prefix}:${ip}`, {
        limit: rule.limit,
        ttl: rule.ttl
      });

      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            wait: reset,
            message: `Please wait ${reset} seconds to request a new OTP.`,
          },
          { status: 429 }
        );
      }
    }

    return await handler(req);

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
};
