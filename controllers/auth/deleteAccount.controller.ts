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
    const userId = req.headers.get("x-temp-user-id");
    if (!userId) throw new ApiError(401, "Unauthorized");

    const userObjectId = new Types.ObjectId(userId);

    // 1️⃣ Fetch all user history
    const historyDocs = await History.find({ investorId: userObjectId });

    for (const history of historyDocs) {
      // Delete all chats in parallel
      await Promise.all(
        history.chats.map(async (chatId:string) => {
          const chat = await Chat.findById(chatId);
          if (chat) {
            await Promise.all([
              GenAiResponseModel.findByIdAndDelete(chat.aiResponse),
              Prompt.findByIdAndDelete(chat.prompt),
              Chat.findByIdAndDelete(chat._id),
            ]);
          }
        })
      );

      // Delete history itself
      await History.findByIdAndDelete(history._id);
    }

    // 2️⃣ Delete user
    const deletedUser = await Investor.findByIdAndDelete(userId);
    if (!deletedUser) throw new ApiError(404, "User not found");

    // 3️⃣ Delete avatar from Cloudinary (optional)
    if (deletedUser?.avatar?.public_id) {
      deleteFromCloudinary(deletedUser.avatar.public_id).catch((err) =>
        console.error("Failed to delete avatar from Cloudinary:", err)
      );
    }

    // 4️⃣ Delete Redis keys in batch
    await redis.del(`user:${userId}`, `chat:${userId}:active`, `history:${userId}`);

    // 5️⃣ Delete cookies
    const cookies = [
      `accessToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
      `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
    ];

    const res = NextResponse.json(
      new ApiResponse(200, null, "User and all related data deleted successfully")
    );

    cookies.forEach((cookie) => res.headers.append("Set-Cookie", cookie));

    return res;
  } catch (err: any) {
    console.error("deleteUser error:", err);
    return  new ApiResponse( err.statusCode || 500,null, err.message || "Internal Server Error" );
  }
};

