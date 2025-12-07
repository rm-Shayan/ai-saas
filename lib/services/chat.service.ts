import { Chat } from "@/models/chat.model";
import { redis } from "@/lib/db-config/db";
import { Types } from "mongoose";
import { safeJsonParse } from "../utils";

// ------------------------------
// REDIS CHAT OBJECT
// ------------------------------
export interface RedisChatObj {
  chatId: string;
  messages: string[];
  investorId?: string;
  title?: string;
  createdAt?: string | Date;
}

// ------------------------------
// RESOLVE CHAT
// ------------------------------
export async function resolveChat(investorId: string, chatId?: string) {
  const safeInvestorId = investorId.replace(/[^a-f0-9]/gi, "");
  const redisKey = `chat:${safeInvestorId}:active`;

  let chatDoc: any = null;
  let redisObj: RedisChatObj | null = null;

  try {
    console.log(
      "🔹 resolveChat | investor:",
      safeInvestorId,
      "| chatId:",
      chatId
    );

    // 1️⃣ Client-provided chatId → check DB

    if (chatId && Types.ObjectId.isValid(chatId)) {
      try {
        chatDoc = await Chat.findById(chatId); // lean() removed
        if (chatDoc)
          console.log("🔹 Chat found using provided chatId:", chatDoc._id);
      } catch {
        chatDoc = null;
      }
    }

    // 2️⃣ Lookup Redis Active Chat if no chat from DB
    if (!chatDoc) {
      let rawRedis: string | null = null;

      try {
        rawRedis = await redis.get(redisKey);
      } catch (err) {
        console.log("⚠️ redis.get error:", err);
      }

      redisObj = rawRedis ? safeJsonParse<RedisChatObj>(rawRedis) : null;
      console.log("🔹 Redis parsed:", redisObj);

      // 2️⃣ Redis lookup
      if (redisObj?.chatId && Types.ObjectId.isValid(redisObj.chatId)) {
        try {
          const tempChat = await Chat.findById(redisObj.chatId); // lean() removed
          if (tempChat) {
            chatDoc = tempChat;
            console.log("🔹 Active chat restored from Redis:", chatDoc._id);
          } else {
            console.log("⚠️ Redis stale key detected → removing");
            await redis.del(redisKey);
            redisObj = null;
          }
        } catch (err) {
          console.log("⚠️ DB lookup failed:", err);
        }
      }
    }

    // 3️⃣ Create new chat if none exists
    if (!chatDoc) {
      chatDoc = await Chat.create({
        investorId: new Types.ObjectId(safeInvestorId),
        title: "New Chat",
        messages: [],
      });

      redisObj = {
        chatId: chatDoc._id.toString(),
        messages: [],
        investorId: safeInvestorId,
        title: chatDoc.title,
        createdAt: chatDoc.createdAt,
      };

      await redis.set(redisKey, JSON.stringify(redisObj)).catch(console.error);
      await redis.expire(redisKey, 86400).catch(console.error); // TTL 24 hours

      console.log("🔹 New Chat created:", redisObj);
    }

    // 4️⃣ Ensure Redis object always has full info
    if (!redisObj) {
      redisObj = {
        chatId: chatDoc._id.toString(),
        messages:
          chatDoc.messages?.map((m: Types.ObjectId) => m.toString()) || [],
        investorId: chatDoc.investorId?.toString(),
        title: chatDoc.title,
        createdAt: chatDoc.createdAt,
      };
    }

    return { chatDoc, redisObj, redisKey };
  } catch (err: any) {
    console.error("❌ resolveChat crashed:", err.message);

    // Fallback
    const fallbackChat = await Chat.create({
      investorId: new Types.ObjectId(safeInvestorId),
      title: "New Chat",
      messages: [],
    });

    const fallbackRedis: RedisChatObj = {
      chatId: fallbackChat._id.toString(),
      messages: [],
      investorId: safeInvestorId,
      title: fallbackChat.title,
      createdAt: fallbackChat.createdAt,
    };

    await redis
      .set(redisKey, JSON.stringify(fallbackRedis))
      .catch(console.error);
    await redis.expire(redisKey, 86400).catch(console.error);

    return { chatDoc: fallbackChat, redisObj: fallbackRedis, redisKey };
  }
}

// ------------------------------
// ATTACH MESSAGE TO CHAT
// ------------------------------
export async function attachMessageToChat(
  chatDoc: any,
  messageDoc: any,
  redisObj: RedisChatObj | null,
  redisKey: string
) {
  try {
    // --------------------------
    // Ensure chatDoc is Mongoose document
    // --------------------------
    if (!chatDoc.save) {
      chatDoc = await Chat.findById(chatDoc._id); // fetch as Mongoose doc
      if (!chatDoc) throw new Error("Chat not found in DB");
    }

    // --------------------------
    // Ensure redisObj exists
    // --------------------------
    if (!redisObj) {
      redisObj = {
        chatId: chatDoc._id.toString(),
        messages:
          chatDoc.messages?.map((m: Types.ObjectId) => m.toString()) || [],
      };
    }

    // --------------------------
    // Update Mongo Chat
    // --------------------------
    chatDoc.messages = chatDoc.messages || [];

    const msgId = messageDoc._id.toString();

    if (!chatDoc.messages.some((m: any) => m.toString() === msgId)) {
      chatDoc.messages.push(messageDoc._id);
      chatDoc.lastMessage = messageDoc._id;
      try {
        await chatDoc.save();
      } catch (err: any) {
        console.error("⚠️ chat.save() failed:", err?.message || err);
        throw new Error("Chat save failed");
      }
    }

    // --------------------------
    // Update Redis Messages
    // --------------------------
    redisObj.messages = redisObj.messages || [];
    if (!redisObj.messages.includes(msgId)) {
      redisObj.messages.push(msgId);
    }

    // Limit Redis Messages
    const LIMIT = 50;
    if (redisObj.messages.length > LIMIT) {
      redisObj.messages = redisObj.messages.slice(-LIMIT);
    }

    // Save to Redis
    await redis
      .set(redisKey, JSON.stringify(redisObj))
      .catch((e) => console.log("⚠️ redis.set failed:", e.message));
       await redis.expire(redisKey,86400)

    return redisObj;
  } catch (err: any) {
    console.error("❌ attachMessageToChat crashed:", err.message);
    return redisObj;
  }
}
