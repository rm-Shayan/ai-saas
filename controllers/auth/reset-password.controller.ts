'use server';

import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import Investor from "@models/inevstor.model";
import { redis } from "@/lib/db-config/db";

export const resetPassword = async (req: NextRequest) => {
  const { token, newPassword } = await req.json();

  console.log(token,newPassword)

  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  // Get userId from Redis using token
  const userId = await redis.get(`pwd-reset:${token}`);
  if (!userId) {
    throw new ApiError(400, "Invalid or expired token");
  }

  // Find user in DB
  const investor = await Investor.findById(userId);
  if (!investor) {
    throw new ApiError(404, "User not found");
  }

  // Check if new password is same as old password
  const isSame = await investor.comparePassword(newPassword);
  if (isSame) {
    throw new ApiError(400, "New password cannot be the same as the old password");
  }

  // Assign new password — pre-save hook will hash it automatically
  investor.password = newPassword;
  await investor.save();

  // Delete token from Redis
  await redis.del(`pwd-reset:${token}`);

  return new ApiResponse(200, null, "Password reset successfully");
};
