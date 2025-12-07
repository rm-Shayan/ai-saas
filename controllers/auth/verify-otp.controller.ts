import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { NextRequest } from "next/server";
import { db, redis } from "@/lib/db-config/db";
import Investor from "@models/inevstor.model";



export const verifyOTP = async (req: NextRequest) => {
  // Ensure DB connection
  await db;

  // Get request body
  const { email, otp } = await req.json();
  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const otpStr = String(otp).trim();

  // Define Redis keys for signup and reset OTP
  const redisKeySignup = `signup_otp:${email}`;
  const redisKeyReset = `reset_otp:${email}`;

  // Fetch user from DB and OTP from Redis (either key)
  const [investor, otpSignup, otpReset] = await Promise.all([
    Investor.findOne({ email }).lean(),
    redis.get(redisKeySignup),
    redis.get(redisKeyReset),
  ]);

  if (!investor) throw new ApiError(404, "Investor not found");

  // Determine which OTP is valid
  const storedOtp = otpReset || otpSignup; // prefer reset OTP over signup OTP
  if (!storedOtp) throw new ApiError(400, "OTP expired or invalid");

  if (String(storedOtp).trim() !== otpStr) {
    throw new ApiError(400, "Invalid OTP");
  }

  // OTP matched → delete both keys & mark user as verified
  await Promise.all([
    redis.del(redisKeySignup),
    redis.del(redisKeyReset),
    Investor.updateOne({ email }, { verified: true }),
  ]);

  return new ApiResponse(
    200,
    { email, verified: true },
    "OTP verified successfully"
  );
};
