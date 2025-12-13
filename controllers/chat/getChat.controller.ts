import { ApiResponse } from "@/lib/api/ApiResponse";
import { ApiError } from "@/lib/api/ApiError";
import { Chat } from "@/models/chat.model";
import { NextRequest } from "next/server";
import { redis } from "@/lib/db-config/db";
import { RedisChatObj } from "@/lib/services/chat.service";
import { hydrateChat } from "@/lib/services/hydrateMessages";
import { Types } from "mongoose";

export const getChat = async (req: NextRequest) => {
  const investorId = req.headers.get("x-temp-user-id")?.trim();
  if (!investorId) throw new ApiError(400, "Missing investor id");

  const url = new URL(req.url);
  const chatId = url.searchParams.get("chatId")?.trim() || undefined;

  const redisKey = `chat:${investorId}:active`;
  console.log("redisKey", redisKey, "chatId", chatId);

  let redisChat: RedisChatObj | null = null;

  // Safe Redis fetch
  const rawRedis = await redis.get(redisKey);
  if (typeof rawRedis === "string" && rawRedis.trim() !== "") {
    try {
      const parsed = JSON.parse(rawRedis);
      if (parsed?.chatId && Array.isArray(parsed.messages)) {
        redisChat = parsed as RedisChatObj;
      } else {
        console.warn("⚠️ Redis data invalid, ignoring:", parsed);
      }
    } catch (err) {
      console.error("❌ Failed to parse Redis data:", err, rawRedis);
    }
  } else {
    console.log("ℹ️ Redis key empty or null");
  }

  console.log("🔹 Redis active chat:", redisChat);

  // ------------------------------------------------
  // 1️⃣ NO chatId → return ACTIVE or LATEST chat
  // ------------------------------------------------
  if (!chatId) {
    if (redisChat) {
      const exists = await Chat.exists({ _id: redisChat.chatId, investorId });
      if (exists) {
        const hydrated = await hydrateChat(redisChat);
        return new ApiResponse(200, hydrated, "Active chat returned");
      }
      await redis.del(redisKey); // stale cleanup
    }

    // Redis expired or missing → fetch last chat from DB
    const lastChat = await Chat.findOne({ investorId }).sort({ createdAt: -1 }).lean();
    if (!lastChat) throw new ApiError(404, "No chat found");

    const redisObj: RedisChatObj = {
      chatId: lastChat._id.toString(),
      investorId,
      title: lastChat.title,
      createdAt: lastChat.createdAt,
      messages: lastChat.messages?.map((m: any) => m.toString()) || [],
    };

    await redis.set(redisKey, JSON.stringify(redisObj)).catch(console.error);
    await redis.expire(redisKey, 86400).catch(console.error); // TTL 24h

    const hydrated = await hydrateChat(redisObj);
    return new ApiResponse(200, hydrated, "Last chat restored as active");
  }

  // ------------------------------------------------
  // 2️⃣ chatId PROVIDED → check Redis first
  // ------------------------------------------------
  if (redisChat && redisChat.chatId === chatId) {
    const hydrated = await hydrateChat(redisChat);
    return new ApiResponse(200, hydrated, "Active chat returned");
  }

  // Redis chat exists but invalid → delete
  if (redisChat) {
    const exists = await Chat.exists({ _id: redisChat.chatId, investorId });
    if (!exists) await redis.del(redisKey);
  }

  // DB fallback for provided chatId
  const chatDoc = await Chat.findOne({ _id: chatId, investorId });
  if (!chatDoc) throw new ApiError(404, "Chat not found");

  const redisObj: RedisChatObj = {
    chatId: chatDoc._id.toString(),
    investorId,
    title: chatDoc.title,
    createdAt: chatDoc.createdAt,
    messages: chatDoc.messages?.map((m: Types.ObjectId) => m.toString()) || [],
  };

  await redis.set(redisKey, JSON.stringify(redisObj)).catch(console.error);
  await redis.expire(redisKey, 86400).catch(console.error); // TTL 24h

  const hydrated = await hydrateChat(redisObj);
  return new ApiResponse(200, hydrated, "Chat restored & set active");
};
