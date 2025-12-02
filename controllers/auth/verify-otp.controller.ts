import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { NextRequest } from "next/server";
import { db, redis } from "@/lib/db-config/db";
import Investor from "@models/inevstor.model";

export const verifyOTP = async (req: NextRequest) => {
  await db; // ensure connection stays

  const body = await req.json();
  const { email, otp } = body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const redisKey = `signup_otp:${email}`;
  const otpStr = String(otp).trim();

  // ⚡ DB & Redis request in parallel
  const [investor, storedOtp] = await Promise.all([
    Investor.findOne({ email }).lean(),          // faster than findOne()
    redis.get(redisKey)                          // Redis fetch same time
  ]);

  if (!investor) throw new ApiError(404, "Investor not found");
  if (!storedOtp) throw new ApiError(400, "OTP expired or invalid");

 if (String(storedOtp).trim() !== otpStr) {
  throw new ApiError(400, "Invalid OTP");
}

  // ⚡ OTP delete & DB update also in parallel
  await Promise.all([
    redis.del(redisKey),
    Investor.updateOne({ email }, { verified: true })
  ]);

  return new ApiResponse(
    200,
    { email, verified: true },
    "OTP verified successfully"
  );
};
