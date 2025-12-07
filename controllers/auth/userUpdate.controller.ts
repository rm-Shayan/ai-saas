"use server"

// app/controllers/auth/userUpdate.controller.ts
import { NextRequest } from "next/server";
import Investor from "@models/inevstor.model";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { sanitizeUser } from "@/lib/helpers/sanitizer.user";
import { uploadToCloudinary } from "@/lib/helpers/uploadCloudImage";
import { deleteFromCloudinary } from "@/lib/helpers/deleteCloudImage";
import { redis } from "@/lib/db-config/db";
import fs from "fs";
import path from "path";

export const updateUser = async (req: NextRequest) => {
  try {
    const userId = req.headers.get("x-temp-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized user");

    // 1️⃣ Parse FormData
    const formData = await req.formData();

    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const phone = formData.get("phone")?.toString();
    const company = formData.get("company")?.toString();
    const oldPassword = formData.get("oldPassword")?.toString();
    const newPassword = formData.get("newPassword")?.toString();

    const avatarFile = formData.get("avatar") as File | null; // file from form

    // 2️⃣ Fetch user
    const user = await Investor.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // 3️⃣ Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (company) user.company = company;

    // 4️⃣ Update password if provided
    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) throw new ApiError(400, "Both old and new passwords required");
      if (oldPassword === newPassword) throw new ApiError(400, "New password must be different");

      const isMatch = await user.comparePassword(oldPassword);
      if (!isMatch) throw new ApiError(400, "Old password is incorrect");

      user.password = newPassword; // hashed by pre-save hook
    }

    // 5️⃣ Handle avatar upload
    if (avatarFile && avatarFile.size > 0) {
      // Convert File to buffer and save in public/uploads
      const arrayBuffer = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadsDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const localFilePath = path.join(uploadsDir, avatarFile.name);
      fs.writeFileSync(localFilePath, buffer);

      // Delete old Cloudinary image if exists
      if (user.avatar?.public_id) {
        await deleteFromCloudinary(user.avatar.public_id);
      }

      // Upload new file to Cloudinary
      const uploaded = await uploadToCloudinary(localFilePath);

      user.avatar = {
        url: uploaded.url,
        public_id: uploaded.publicId,
      };
    }

    // 6️⃣ Save user
    await user.save();

    // 7️⃣ Update Redis cache
    const redisKey = `user:${userId}`;
    await redis.set(redisKey, JSON.stringify(sanitizeUser(user)));

    return new ApiResponse(200, sanitizeUser(user), "Profile updated successfully");

  } catch (err: any) {
    throw new ApiError(err.statusCode || 500, err.message || "Server error");
  }
};
