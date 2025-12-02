import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/middlewares/rate-limiter";
import { asynchandler } from "@/lib/api/asyncHandler";
import { signUpUser } from "@/controllers/auth/signup.controller";
import { db } from "@/lib/db-config/db";


const handler = asynchandler(signUpUser);

export const POST = async (req: NextRequest) => {
  try {
    await db;

    // Get client IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "127.0.0.1";

    // Rate limiter config
    const options = {
      keyPrefix: "signup",   // <— important
      limit: 3,              // max 3 requests
      ttl: 300               // 5 minutes
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

    return await handler(req);

  } catch (err: any) {
    console.error("Signup route error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
};
