// app/controllers/auth/refreshToken.controller.ts
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { verifyToken } from "@/lib/helpers/verify-jwt";
import { generateTokens } from "@/lib/helpers/generateTokens";
import Investor from "@models/inevstor.model";

export const refreshToken = async (req: NextRequest) => {
  try {
    // 1️⃣ Get refresh token from cookies
    const refToken = req.cookies.get("refreshToken")?.value;

    if (!refToken) throw new ApiError(401, "Refresh token missing");

    // 2️⃣ Verify refresh token
    const decoded: any = await verifyToken(
      refToken,
      process.env.REFRESH_TOKEN_SECRET!
    );

    if (!decoded || (!decoded._id && !decoded.id)) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // 3️⃣ Extract userId safely
    const userId = decoded._id || decoded.id;

    // 4️⃣ Fetch user from DB
    const user = await Investor.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // 5️⃣ Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    // 6️⃣ Prepare response and set cookies properly using res.cookies
    const res = NextResponse.json(
      new ApiResponse(200, { accessToken }, "Tokens refreshed successfully")
    );

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    res.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err: any) {
    console.error("Refresh token error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
};
