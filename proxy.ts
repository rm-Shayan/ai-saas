// middleware/proxy.ts (Next.js 15+ Network Boundary)
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/helpers/verify-jwt";

export default async function proxy(req: NextRequest) {
  console.log("===== Proxy Middleware Hit =====");
  console.log("Request Pathname:", req.nextUrl.pathname);
  console.log("Request Method:", req.method);
  console.log("Request URL:", req.url);

  // Get access token from cookies
  const token = req.cookies.get("accessToken")?.value;
  console.log("Access Token from cookie:", token);

  if (!token) {
    console.warn("No access token found! Rejecting request.");
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

    console.log("Decoded JWT payload:", payload);

    if (!payload) {
      throw new Error("Invalid token payload");
    }

    // Extract user ID (support _id, id, sub)
    const userId = payload._id || payload.id || payload.sub;

    if (!userId) {
      throw new Error("User ID not found in token payload");
    }

    console.log("Extracted userId:", userId);

    // Rewrite URL and set custom header
    const url = new URL(req.url);
    const res = NextResponse.rewrite(url);
    res.headers.set("x-temp-user-id", userId); // <-- pass userId via header
    console.log("User ID set in header for route:", userId);

    return res;

  } catch (error: any) {
    console.error("JWT verification failed:", error.message);

    const res = NextResponse.json(
      { success: false, message: error.message || "Unauthorized" },
      { status: 401 }
    );

    // Delete token if invalid
    res.cookies.delete("accessToken");
    return res;
  }
}

// Apply proxy only on /api/auth/user route
export const config = {
  matcher: ["/api/auth/user", "/api/auth/user/:path*","/api/chat/:path*","/api/prompt","/api/prompt/:path*","/api/history/:path*"],
};
