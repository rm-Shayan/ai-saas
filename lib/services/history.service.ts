import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { redis } from "@/lib/db-config/db";
import { History } from "@/models/history.model";
import { Types } from "mongoose";
import { safeJsonParse } from "../utils";

export interface RedisHistoryObj {
  _id: string;
  chats: string[];
  investorId: string;
}

const MAX_CHATS = 100;

// 🔹 Safe JSON parse utility


// 🔹 Update / Fetch user history
export async function updateUserHistory(investorId: string, chatId?: string) {
  const historyKey = `history:${investorId}`;
  let historyObj: RedisHistoryObj | null = null;
  const investorObjectId = new Types.ObjectId(investorId);

  try {
    // 1️⃣ Try Redis first
    const rawRedis = await redis.get(historyKey);
    const parsedRedis = safeJsonParse<RedisHistoryObj>(rawRedis);
    if (parsedRedis && parsedRedis._id) {
      historyObj = { ...parsedRedis, chats: Array.isArray(parsedRedis.chats) ? parsedRedis.chats : [] };
    }

    // 2️⃣ DB fallback
    let dbHistory = await History.findOne({ investorId: investorObjectId });

    if (!dbHistory) {
      // Delete invalid Redis
      if (historyObj) await redis.del(historyKey);
      // Create new DB history
      dbHistory = await History.create({
        investorId: investorObjectId,
        chats: chatId && Types.ObjectId.isValid(chatId) ? [new Types.ObjectId(chatId)] : [],
      });
    }

    // Ensure historyObj initialized
    if (!historyObj) {
      historyObj = {
        _id: dbHistory._id.toString(),
        investorId,
        chats: dbHistory.chats.map((c: any) => c.toString()),
      };
    }

    // 3️⃣ Add new chatId if missing
    if (chatId && Types.ObjectId.isValid(chatId) && !historyObj.chats.includes(chatId)) {
      await History.updateOne(
        { _id: historyObj._id },
        { $addToSet: { chats: new Types.ObjectId(chatId) } }
      );
      historyObj.chats.push(chatId);

      // Cap MAX_CHATS
      if (historyObj.chats.length > MAX_CHATS) {
        const removeCount = historyObj.chats.length - MAX_CHATS;
        historyObj.chats.splice(0, removeCount);
        await History.updateOne(
          { _id: historyObj._id },
          { $set: { chats: historyObj.chats.map(c => new Types.ObjectId(c)) } }
        );
      }
    }

    // 4️⃣ Save to Redis with TTL 24h
    await redis.set(historyKey, JSON.stringify(historyObj));
    await redis.expire(historyKey, 86400);

    return historyObj;
  } catch (err) {
    console.error("❌ updateUserHistory error:", err);
    throw err;
  }
}

// 🔹 GetHistory API
export const GetHistory = async (req: NextRequest) => {
  try {
    const investorId = req.headers.get("x-temp-user-id");
    if (!investorId) throw new ApiError(400, "Investor ID missing");

    // Use updateUserHistory to safely get Redis/DB history
    const history = await updateUserHistory(investorId);

    // Return only _id and chats[]
    return new ApiResponse( 200, { _id: history._id, chats: history.chats || [] }, "History IDs fetched"
    );
  } catch (err: any) {
    throw new ApiError(500, err.message);
  }
};
