import { Chat } from "@/models/chat.model";
import { History } from "@/models/history.model";
import { redis } from "@/lib/db-config/db";
import { Types } from "mongoose";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { RedisHistoryObj } from "../History/getHistory.controller";
import { RedisChatObj } from "@/lib/services/chat.service";

export const createNewChat = async (req: any) => {
  const investorId = req.headers.get("x-temp-user-id")?.trim();
  if (!investorId) throw new ApiError(400, "Missing investor id");
  if (!Types.ObjectId.isValid(investorId))
    throw new ApiError(400, "Invalid investor id");

  const redisKey = `chat:${investorId}:active`;
  const redisHistoryKey = `history:${investorId}`;

  // ------------------------------
  // Step 1: Remove existing active chat in Redis (ignore errors)
  // ------------------------------
  await redis.del(redisKey).catch(() => null);

  // ------------------------------
  // Step 2: Create new chat in MongoDB
  // ------------------------------
  const chatDoc = await Chat.create({
    investorId: new Types.ObjectId(investorId),
    title: "New Chat",
    messages: [],
  });

  // ------------------------------
  // Step 3: Upsert History in MongoDB
  // ------------------------------
  const historyDoc = await History.findOneAndUpdate(
    { investorId },
    { $push: { chats: chatDoc._id }, $setOnInsert: { investorId: new Types.ObjectId(investorId) } },
    { new: true, upsert: true }
  );

  // ------------------------------
  // Step 4: Save active chat in Redis (TTL 1 day)
  // ------------------------------
  const redisChat: RedisChatObj = {
    chatId: chatDoc._id.toString(),
    messages: [],
    investorId,
    title: chatDoc.title,
    createdAt: chatDoc.createdAt,
  };
  await redis.set(redisKey, JSON.stringify(redisChat));
  await redis.expire(redisKey, 86400);

  // ------------------------------
  // Step 5: Save History in Redis (TTL 1 day)
  // ------------------------------
  const redisHistory: RedisHistoryObj = {
    _id: historyDoc._id.toString(),
    investorId,
    chats: historyDoc.chats.map((c: any) => c.toString()),
  };
  await redis.set(redisHistoryKey, JSON.stringify(redisHistory));
  await redis.expire(redisHistoryKey, 86400);

  return new ApiResponse(200, { chat: chatDoc, history: historyDoc }, "Chat created successfully");
};
