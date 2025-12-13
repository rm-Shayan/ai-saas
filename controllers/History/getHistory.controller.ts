import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { redis } from "@/lib/db-config/db";
import { History } from "@/models/history.model";
import { Types } from "mongoose";

export interface RedisHistoryObj {
  _id: string;
  chats: string[];
  investorId: string;
}

function safeJsonParse<T>(str: string | null): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

export const GetHistory = async (req: NextRequest) => {
  try {
    const investorId = req.headers.get("x-temp-user-id");
    if (!investorId) throw new ApiError(400, "Investor ID missing");

    const url = new URL(req.url);
    const sinceParam = url.searchParams.get("since"); // ISO string or timestamp
    const untilParam = url.searchParams.get("until");
    const since = sinceParam ? new Date(sinceParam) : null;
    const until = untilParam ? new Date(untilParam) : null;

    const redisKey = `history:${investorId}`;
    let historyDoc: RedisHistoryObj | null = null;

    // ---------------------------------
    // 1️⃣ Redis GET with SAFE PARSE
    // ---------------------------------
    const cached = await redis.get(redisKey);
    if (cached) {
        if(typeof cached =="string" && cached!==""){
      const parsed = safeJsonParse<RedisHistoryObj>(cached);
      if (parsed && parsed._id && Array.isArray(parsed.chats)) {
        historyDoc = parsed;
      }
    }
    }
    // ---------------------------------
    // 2️⃣ Redis MISS → DB
    // ---------------------------------
    if (!historyDoc) {
      const dbHistory = await History.findOne({ investorId });

      if (!dbHistory) {
        const newHistory = await History.create({ investorId, chats: [] });
        historyDoc = { _id: newHistory._id.toString(), investorId, chats: [] };
      } else {
        historyDoc = {
          _id: dbHistory._id.toString(),
          investorId,
         chats: Array.isArray(dbHistory.chats) 
  ? dbHistory.chats.map((c: any) => c.toString()) 
  : []
        };
      }

      try {
        await redis.set(redisKey, JSON.stringify(historyDoc));
        await redis.expire(redisKey, 86400); // 24h TTL
      } catch (err) {
        console.error("❌ Failed to set Redis key:", err);
      }
    }

    // ---------------------------------
    // 3️⃣ Time-based filtering
    // ---------------------------------
    let filteredChats = historyDoc.chats;

    if ((since || until) && filteredChats.length > 0) {
      const objectIds = filteredChats.map(id => new Types.ObjectId(id));
      const match: any = { _id: { $in: objectIds } };

      if (since) match.createdAt = { $gte: since };
      if (until) match.createdAt = { ...match.createdAt, $lte: until };

      const chatsFromDB = await History.db.collection("chats").find(match).toArray();
      filteredChats = chatsFromDB.map(c => c._id.toString());
    }

    // ---------------------------------
    // 4️⃣ Return result
    // ---------------------------------
    return new ApiResponse( 200,
      { _id: historyDoc._id, chats: filteredChats },
      "History fetched successfully"
    );

  } catch (err: any) {
    throw new ApiError(500, err.message);
  }
};

