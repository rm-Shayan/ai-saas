import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db-config/db";
import { rateLimiter } from "@/lib/helpers/rate-limiter";
import { asynchandler } from "@/lib/api/asyncHandler";
import { handleUserPrompt } from "@/controllers/prompt/handlePrompt.controller";

// Wrap controller with asyncHandler
const handler = asynchandler(handleUserPrompt);

export const POST = async (req: NextRequest) => {
  try {
    // 1️⃣ Ensure DB is connected
    await db;

    // 2️⃣ Get client IP for rate limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0] || "127.0.0.1";

    // 3️⃣ Rate limiter config: max 5 requests per minute
    const options = {
      keyPrefix: "user-prompt",
      limit: 5,
      ttl: 60, // 1 minute in seconds
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


    // 5️⃣ Call controller (handleUserPrompt)
    return await handler(req);

  } catch (err: any) {
    console.error("Prompt route error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
};
