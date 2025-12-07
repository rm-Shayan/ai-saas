import { History } from "@/models/history.model";
import { redis } from "@/lib/db-config/db";
import { Types } from "mongoose";
import { safeJsonParse } from "../utils";

interface RedisHistoryObj {
  _id: string;
  chats: string[];
}

const MAX_CHATS = 100;

export async function updateUserHistory(investorId: string, chatId?: string) {
  const historyKey = `history:${investorId}`;
  let historyObj: RedisHistoryObj | null = null;
  const investorObjectId = new Types.ObjectId(investorId);

  try {
    console.log("🔹 updateUserHistory | Start | investorId:", investorId, "chatId:", chatId);

    // 1️⃣ Try Redis first
    try {
      const raw = await redis.get(historyKey);
      if (raw) {
        const parsed = safeJsonParse<RedisHistoryObj>(raw);
        if (parsed && parsed._id) {
          historyObj = { _id: parsed._id, chats: Array.isArray(parsed.chats) ? parsed.chats : [] };
        }
        console.log("🔹 Redis GET result:", historyObj);
      }
    } catch (redisErr) {
      console.error("⚠️ Redis GET failed:", redisErr);
    }

    // 2️⃣ Check DB
    let dbHistory = await History.findOne({ investorId: investorObjectId });

    if (!dbHistory) {
      console.log("🔹 DB has no history");

      // If Redis exists but DB doesn't → delete Redis key
      if (historyObj) {
        await redis.del(historyKey);
        console.log("🔹 Redis key deleted because DB history missing");
        historyObj = null;
      }

      // Create new DB history
      dbHistory = await History.create({
        investorId: investorObjectId,
        chats: chatId && Types.ObjectId.isValid(chatId) ? [new Types.ObjectId(chatId)] : [],
      });
      console.log("🔹 New history created in DB:", dbHistory);

   historyObj = {
  _id: dbHistory._id.toString(),
  chats: dbHistory.chats.map((c: any) => c.toString()),
};

    } else {
      // DB exists → make sure historyObj is initialized
      if (!historyObj) {
       historyObj = {
  _id: dbHistory._id.toString(),
  chats: dbHistory.chats.map((c: any) => c.toString()),
}
      }
    }

    // 3️⃣ Add new chatId if valid and missing
    if (chatId && Types.ObjectId.isValid(chatId) && !historyObj.chats.includes(chatId)) {
      const chatObjectId = new Types.ObjectId(chatId);

      // Push to DB with $addToSet
      await History.updateOne(
        { _id: historyObj._id },
        { $addToSet: { chats: chatObjectId } }
      );

      // Push to local historyObj array
      historyObj.chats.push(chatId);

      // 4️⃣ Cap chats array at MAX_CHATS
      if (historyObj.chats.length > MAX_CHATS) {
        const removeCount = historyObj.chats.length - MAX_CHATS;
        historyObj.chats.splice(0, removeCount); // remove oldest chats
        await History.updateOne(
          { _id: historyObj._id },
          { $set: { chats: historyObj.chats.map(c => new Types.ObjectId(c)) } }
        );
        console.log(`🔹 Chats array capped at ${MAX_CHATS}, removed ${removeCount} oldest chats`);
      }

      console.log("🔹 Added new chatId to history:", chatId);
    }

    // 5️⃣ Save updated history to Redis
    await redis.set(historyKey, JSON.stringify(historyObj));
    await redis.expire(historyKey, 86400); // 24h TTL
    console.log("🔹 Redis updated successfully:", historyObj);

    return historyObj;
  } catch (err) {
    console.error("❌ updateUserHistory crashed:", err);
    throw err;
  }
}
