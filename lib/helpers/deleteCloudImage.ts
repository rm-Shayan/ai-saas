import cloudinary from "@/lib/services/cloudinary";

export async function deleteFromCloudinary(publicId: string) {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    throw new Error("Cloudinary Delete Failed: " + error.message);
  }
}
