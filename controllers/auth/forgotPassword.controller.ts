
import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import Investor from "@models/inevstor.model";
import { sendMail } from "@/lib/helpers/email";
import crypto from "crypto";
import { redis } from "@/lib/db-config/db"; // Upstash Redis client

export const forgotPassword = async (req: NextRequest) => {
  const { email } = await req.json();

  if (!email) {
    throw new ApiError(400, "Email is required for this action");
  }

  const investor = await Investor.findOne({ email });
  if (!investor) {
    throw new ApiError(404, "User with this email does not exist");
  }

  // Generate a secure random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Save token in Redis with expiry (10 minutes)
  // Upstash uses SET with EX or EXAT
  await redis.set(`pwd-reset:${resetToken}`, investor._id.toString(), {
    ex: 600, // 10 minutes in seconds
  });

  // Build frontend reset URL
  const FRONTEND_URL = process.env.PROD_URL?.trim();

const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

  // Send email
  try {
    await sendMail({
      from: process.env.SMTP_SERVER_USERNAME || "no-reply@example.com",
      to: investor.email,
      subject: "Password Reset Request",
      text: `Hello ${investor.name || ""},\n\nYou requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`,
    });
  } catch (err: any) {
    console.error("Email sending failed:", err);
    throw new ApiError(500, "Failed to send password reset email");
  }

  // Return success
  return new ApiResponse(200, null, "Password reset email sent successfully");
};
