import { ApiResponse } from "@/lib/api/ApiResponse";
import { ApiError } from "@/lib/api/ApiError";
import Investor from "@models/inevstor.model";
import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/chat.model";
import { GenAiResponseModel } from "@/models/genaiResponse.model";
import { History } from "@/models/history.model";
import { Prompt } from "@/models/prompt.model";
import { redis } from "@/lib/db-config/db";
import { Types } from "mongoose";
import { deleteFromCloudinary } from "@/lib/helpers/deleteCloudImage";

export const deleteUser = async (req: NextRequest) => {
  try {
    // 1️⃣ Get userId from headers
    const userId = req.headers.get("x-temp-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const userObjectId = new Types.ObjectId(userId);

    // 2️⃣ Delete all related data
    const historyDocs = await History.find({ investorId: userObjectId });
    for (const history of historyDocs) {
      // Delete all chats
      for (const chatId of history.chats) {
        const chat = await Chat.findById(chatId);
        if (chat) {
          await GenAiResponseModel.findByIdAndDelete(chat.aiResponse);
          await Prompt.findByIdAndDelete(chat.prompt);
          await Chat.findByIdAndDelete(chat._id);
        }
      }
      await History.findByIdAndDelete(history._id);
    }

    // 3️⃣ Delete user
    const deletedUser = await Investor.findByIdAndDelete(userId);
    if (!deletedUser) throw new ApiError(404, "User not found");

    // Inside your try block, after fetching deletedUser
    if (deletedUser?.avatar?.public_id) {
      try {
        await deleteFromCloudinary(deletedUser.avatar.public_id);
        console.log(
          "User avatar deleted from Cloudinary:",
          deletedUser.avatar.public_id
        );
      } catch (err) {
        console.error("Failed to delete avatar from Cloudinary:", err);
        // Optional: continue without failing the whole deletion
      }
    }

    // 4️⃣ Delete Redis cache for user & history
    await redis.del(`user:${userId}`);
    await redis.del(`history:${userId}`);

    // 5️⃣ Remove cookies
    const deleteAccessCookie = [
      `accessToken=`,
      "HttpOnly",
      "Path=/",
      "Max-Age=0",
      "SameSite=Lax",
    ].join("; ");

    const deleteRefreshCookie = [
      `refreshToken=`,
      "HttpOnly",
      "Path=/",
      "Max-Age=0",
      "SameSite=Lax",
    ].join("; ");

    // 6️⃣ Return response
    const res = NextResponse.json(
      new ApiResponse(
        200,
        null,
        "User and all related data deleted successfully"
      )
    );

    res.headers.append("Set-Cookie", deleteAccessCookie);
    res.headers.append("Set-Cookie", deleteRefreshCookie);

    return res;
  } catch (err: any) {
    console.error("deleteUser error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Internal Server Error",
      },
      { status: err.statusCode || 500 }
    );
  }
};
