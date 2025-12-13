import { NextRequest, NextResponse } from "next/server";
import Investor from "@models/inevstor.model";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { sanitizeUser } from "@/lib/helpers/sanitizer.user";
import { generateTokens } from "@/lib/helpers/generateTokens";

export const loginUser = async (req: NextRequest) => {
  const { email, password } = await req.json();

  if (!email || !password) {
    throw new ApiError(400, "Email and password required");
  }

  const investor = await Investor.findOne({ email }).select("+password +refreshToken");
  if (!investor) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await investor.comparePassword(password);
  console.log(isMatch)
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(investor);

  investor.refreshToken = refreshToken;
  await investor.save();



  // Build NextResponse and wrap ApiResponse
  const response = NextResponse.json(
    new ApiResponse(200, sanitizeUser(investor), "Logged in successfully")
  );

  // Set Access Token cookie
response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
     sameSite: process.env.NODE_ENV === "production" ?"none":"lax",
    path: "/",
    maxAge: 15 * 60,
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ?"none":"lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
};
