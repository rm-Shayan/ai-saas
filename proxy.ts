// middleware/proxy.ts (Next.js 15+ Network Boundary / Middleware)
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/helpers/verify-jwt";

export default async function proxy(req: NextRequest) {
  // Get access token from cookies
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Access token missing" },
      { status: 401 }
    );
  }

  try {
    // Verify JWT
    const payload: any = await verifyToken(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    );

    if (!payload) {
      throw new Error("Invalid token payload");
    }

    // Extract user ID (support _id, id, sub)
    const userId = payload._id || payload.id || payload.sub;

    if (!userId) {
      throw new Error("User ID not found in token payload");
    }

    // Forward userId via incoming request header so route handlers can read req.headers.get("x-temp-user-id")
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-temp-user-id", String(userId));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error: any) {
    const res = NextResponse.json(
      { success: false, message: error.message || "Unauthorized" },
      { status: 401 }
    );

    // Delete invalid token
    res.cookies.delete("accessToken");
    return res;
  }
}

// Match all protected API routes
export const config = {
  matcher: [
    "/api/auth/user",
    "/api/auth/user/:path*",
    "/api/chat",
    "/api/chat/:path*",
    "/api/prompt",
    "/api/prompt/:path*",
    "/api/history",
    "/api/history/:path*",
  ],
};
