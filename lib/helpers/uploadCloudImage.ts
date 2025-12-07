"use server"

import cloudinary from "@/lib/services/cloudinary";
import fs from "fs";
import { ApiError } from "@lib/api/ApiError";

export async function uploadToCloudinary(localFilePath: string) {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "next_uploads",
      resource_type: "auto",
      upload_preset: process.env.CLOUDINARY_PRESET!, // Correct ✔
    });

    // Remove local file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error: any) {
    // Remove local file on error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    throw new ApiError(500, "Cloudinary Upload Failed: " + error.message);
  }
}
