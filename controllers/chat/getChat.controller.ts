import { ApiResponse } from "@/lib/api/ApiResponse";
import { ApiError } from "@/lib/api/ApiError";
import { Chat } from "@/models/chat.model";
import { NextRequest } from "next/server";
import { redis } from "@/lib/db-config/db";
import { RedisChatObj } from "@/lib/services/chat.service";
import { hydrateChat } from "@/lib/services/hydrateMessages";
import { safeParseRedisChat } from "@/lib/utils";
import { Types } from "mongoose";


export const getChat = async (req: NextRequest) => {
  const investorId = req.headers.get("x-temp-user-id")?.trim();
  if (!investorId) throw new ApiError(400, "Missing investor id");

  const { chatId } = await req.json();
  const redisKey = `chat:${investorId}:active`;

  // -------------------------------
  // 1️⃣ Try Redis first
  // -------------------------------
  let redisChat: RedisChatObj | null = safeParseRedisChat(await redis.get(redisKey));

  if (!chatId) {
    if (!redisChat) throw new ApiError(404, "No active chat found");

    // verify chat still exists in DB
    const exists = await Chat.exists({ _id: redisChat.chatId, investorId });
    if (!exists) {
      await redis.del(redisKey);
      throw new ApiError(404, "Active chat invalid. Removed from Redis.");
    }

    const hydrated = await hydrateChat(redisChat);
    return new ApiResponse(200, hydrated, "Active chat returned");
  }

  // -------------------------------
  // 2️⃣ chatId given → check Redis match
  // -------------------------------
  if (redisChat && redisChat.chatId === chatId) {
    const hydrated = await hydrateChat(redisChat);
    return new ApiResponse(200, hydrated, "Active chat returned");
  }

  // If Redis chat invalid → remove
  if (redisChat) {
    const exists = await Chat.exists({ _id: redisChat.chatId, investorId });
    if (!exists) await redis.del(redisKey);
  }

  // -------------------------------
  // 3️⃣ DB fallback
  // -------------------------------
  const chatDoc = await Chat.findOne({ _id: chatId, investorId });
  if (!chatDoc) throw new ApiError(404, "Chat not found");

  const redisObj: RedisChatObj = {
    chatId: chatDoc._id.toString(),
    investorId,
    title: chatDoc.title,
    createdAt: chatDoc.createdAt,
 messages: chatDoc.messages?.map((m: Types.ObjectId) => m.toString()) || [],

  };

  await redis.set(redisKey, JSON.stringify(redisObj));
  const hydrated = await hydrateChat(redisObj);

  return new ApiResponse(200, hydrated, "Chat restored from DB");
};
