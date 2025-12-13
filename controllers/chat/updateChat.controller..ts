import { ApiResponse } from "@/lib/api/ApiResponse";
import { ApiError } from "@/lib/api/ApiError";
import { Chat } from "@/models/chat.model";
import { NextRequest } from "next/server";
import { redis } from "@/lib/db-config/db";
import { RedisChatObj } from "@/lib/services/chat.service";

export const UpdateChat = async (req: NextRequest) => {
  const investorId = req.headers.get("x-temp-user-id")?.trim();
  if (!investorId) throw new ApiError(400, "Missing investor id");

  const redisKey = `chat:${investorId}:active`;
  let redisChat: RedisChatObj | null = null;

  // 🔹 Safe Redis fetch
  try {
    const rawRedis = await redis.get(redisKey);
    if (typeof rawRedis === "string" && rawRedis.trim() !== "") {
      try {
        const parsed = JSON.parse(rawRedis);
        if (parsed?.chatId && Array.isArray(parsed.messages)) {
          redisChat = {
            ...parsed,
            chatId: parsed.chatId.toString(), // ensure string
            messages: parsed.messages.map((m: any) => m.toString()),
          };
        } else {
          console.warn("⚠️ Redis data invalid, ignoring:", parsed);
        }
      } catch (err) {
        console.error("❌ Failed to parse Redis data:", err, rawRedis);
      }
    }
  } catch (err) {
    console.error("❌ Redis GET failed:", err);
  }

  // 🔹 Parse request body safely
  let body: { chatId?: string; title?: string } = {};
  try {
    body = await req.json();
  } catch (err) {
    throw new ApiError(400, "Invalid JSON body");
  }

  const { chatId, title } = body;
  if (!title || typeof title !== "string") throw new ApiError(400, "Title is required");

  let targetChatId = chatId?.toString().trim() || redisChat?.chatId;

  // 🔹 If no chatId → fetch last chat from DB
  if (!targetChatId) {
    const lastChat = await Chat.findOne({ investorId }).sort({ createdAt: -1 }).lean();
    if (!lastChat) throw new ApiError(404, "No chat found to update");

    targetChatId = lastChat._id.toString();
    redisChat = {
      chatId: String(targetChatId || ""),
      investorId,
      title: lastChat.title,
      createdAt: lastChat.createdAt,
      messages: lastChat.messages?.map((m: any) => m.toString()) || [],
    };

    try {
      await redis.set(redisKey, JSON.stringify(redisChat));
      await redis.expire(redisKey, 86400);
    } catch (err) {
      console.error("❌ Failed to set Redis key:", err);
    }
  }

  // 🔹 Update chat in DB
  const chat = await Chat.findOne({ _id: targetChatId, investorId });
  if (!chat) throw new ApiError(404, "Chat not found");

  chat.title = title;
  await chat.save();

  // 🔹 Update Redis if active chat matches
  try {
    const rawRedis = await redis.get(redisKey);
    if (typeof rawRedis === "string" && rawRedis.trim() !== "") {
      const parsed = JSON.parse(rawRedis);
      if (parsed?.chatId?.toString() === targetChatId) {
        const redisObj: RedisChatObj = {
          ...parsed,
          chatId: targetChatId,
          title,
          messages: Array.isArray(parsed.messages) ? parsed.messages.map((m: any) => m.toString()) : [],
        };
        const ttl = (await redis.ttl(redisKey)) || 0;
        await redis.set(redisKey, JSON.stringify(redisObj));
        if (ttl > 0) await redis.expire(redisKey, ttl);
      }
    }
  } catch (err) {
    console.error("❌ Failed to update Redis after DB update:", err);
  }

  return new ApiResponse(200, chat, "Chat updated successfully");
};
