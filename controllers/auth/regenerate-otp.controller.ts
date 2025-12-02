import { NextRequest } from "next/server";
import { db, redis } from "@/lib/db-config/db";
import Investor from "@models/inevstor.model";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { generateOTP } from "@/lib/helpers/otp";
import { sendMail } from "@/lib/helpers/email";

export const resetOTP = async (req: NextRequest) => {
  await db; // stable connection hold

  const { email } = await req.json();
  if (!email) throw new ApiError(400, "Email is required");

  // ⚡ DB lookup (lean -> 40% faster)
  const investor = await Investor.findOne({ email }).lean();
  if (!investor) throw new ApiError(404, "No user with this email exists");

  if (investor.verified)
    throw new ApiError(403, "This account is already verified");

  const otp = generateOTP(6);
  const redisKey = `reset_otp:${email}`;

  // ⚡ Redis store & Email send → parallel
  await Promise.all([
    redis.set(redisKey, otp, { ex: 300 }), // set OTP (5 min TTL)
    sendMail({
      from: process.env.SMTP_SERVER_USERNAME!,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Hello ${investor.name}, your OTP is: ${otp}`,
      html: `<p>Hello <strong>${investor.name}</strong>,</p>
             <p>Your OTP for password reset is: <strong>${otp}</strong></p>`
    })
  ]);

  console.log(`Reset OTP sent to ${email}: ${otp}`);

  return new ApiResponse(
    200,
    { email },
    "OTP sent successfully 🚀"
  );
};
