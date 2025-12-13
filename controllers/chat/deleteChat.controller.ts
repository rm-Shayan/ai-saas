import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { Chat } from "@/models/chat.model";
import { NextRequest } from "next/server";
import { redis } from "@/lib/db-config/db";
import { Prompt } from "@/models/prompt.model";
import { GenAiResponseModel } from "@/models/genaiResponse.model";
import { Message } from "@/models/Messages.model";
import { History } from "@/models/history.model";
import { Types } from "mongoose";
import { RedisHistoryObj } from "@/lib/services/history.service";


// ✅ Corrected DeleteChat function
export const DeleteChat = async (req: NextRequest) => {
  console.log("🚀 DeleteChat | Start");

  const investorId = req.headers.get("x-temp-user-id")?.trim();
  if (!investorId) throw new ApiError(400, "Missing investor id");

  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  let { chatId, deleteAll } = body;
  deleteAll = deleteAll === true || deleteAll === "true";

  const redisKey = `history:${investorId}`;
  let historyDoc: RedisHistoryObj | null = null;
let newActiveChatId: string | null = null;

  // 1️⃣ Load history from Redis
  try {
      let cached = await redis.get(redisKey);
    if (cached) {
      // Agar Redis me object store ho gaya ho, stringify kar lo
      if (typeof cached !== "string") cached = JSON.stringify(cached);
      if (cached!== "" && typeof cached == "string") {
        const parsed: RedisHistoryObj = JSON.parse(cached);
        if (parsed?._id && Array.isArray(parsed.chats)) {
          historyDoc = parsed;
          console.log("🔹 History loaded from Redis:", historyDoc);
        }
      }
    }
  } catch (err) { console.error("❌ Redis parse failed:", err); }

  // 2️⃣ Fallback DB fetch if Redis miss
  if (!historyDoc) {
    const dbHistory = await History.findOne({ investorId });
    if (!dbHistory) return new ApiResponse(200, null, "No history found");
    historyDoc = {
      _id: dbHistory._id.toString(),
      investorId,
chats: dbHistory.chats.map((c: string | Types.ObjectId) => c?.toString() || ""),
    };
    await redis.set(redisKey, JSON.stringify(historyDoc));
    await redis.expire(redisKey, 86400);
    console.log("🔹 Redis updated with DB history:", historyDoc);
  }

  // 3️⃣ Determine chats to delete
  let chatsToDelete: Types.ObjectId[] = [];

  if (deleteAll) {
  // Prepare all chat IDs to delete
  chatsToDelete = historyDoc.chats.map(c => new Types.ObjectId(c));

  // Delete Redis active chat if exists
  const activeKey = `chat:${investorId}:active`;
  try {
    let activeRaw: string | null = await redis.get(activeKey);

    // Ensure activeRaw is a string
    if (activeRaw && typeof activeRaw !== "string") activeRaw = JSON.stringify(activeRaw);

    if (activeRaw && activeRaw!== "") {
      await redis.del(activeKey);
      console.log("🔹 Redis activeChat key deleted (deleteAll)");
    }
  } catch (err) {
    console.error("❌ Failed to delete Redis activeChat (deleteAll):", err);
  }

  console.log("🔹 Deleting ALL chats:", historyDoc.chats);
} else {
  if (!chatId) {
    // Fallback: active chat from Redis
    try {
      const activeKey = `chat:${investorId}:active`;
      let activeRaw: string | null = await redis.get(activeKey);

      if (activeRaw && typeof activeRaw !== "string") activeRaw = JSON.stringify(activeRaw);

      if (activeRaw && activeRaw!== "" && typeof activeRaw =="string") {
        const activeParsed = JSON.parse(activeRaw);
        chatId = activeParsed?.chatId;

        if (chatId) {
          await redis.del(activeKey);
          console.log("🔹 Fallback activeChat deleted from Redis:", chatId);
        }
      }
    } catch (err) {
      console.error("❌ Failed to fetch activeChat from Redis:", err);
    }
  }

  if (!chatId) return new ApiResponse(200, null, "No chatId provided and no active chat found");
  if (!historyDoc.chats.includes(chatId)) return new ApiResponse(200, null, "ChatId not found in history");

  chatsToDelete = [new Types.ObjectId(chatId)];
  console.log("🔹 Deleting single chat:", chatId);

   const remainingChats = historyDoc.chats.filter(c => c !== chatId);
    newActiveChatId = remainingChats.length > 0 ? remainingChats[remainingChats.length - 1] : null;

}

  // 4️⃣ Fetch chats & related messages
  const chats = await Chat.find({ _id: { $in: chatsToDelete }, investorId });
  const allMessageIds: Types.ObjectId[] = [];
  chats.forEach(chat => {
    if (chat.messages?.length) {
      allMessageIds.push(
  ...chat.messages
    .filter((m: string | Types.ObjectId) => !!m) // skip null/undefined
    .map((m: string | Types.ObjectId) => {
      if (typeof m === "string") return new Types.ObjectId(m);
      return m;
    })
);
    }
  });
  console.log("🔹 Related message IDs:", allMessageIds);

  // 5️⃣ Delete Messages, Prompts, AI Responses
 if (allMessageIds.length > 0) {

 // 1️⃣ Get all Message docs for the chat(s)
const messages = await Message.find({ _id: { $in: allMessageIds } });

// 2️⃣ Collect Prompt and GenAiResponse IDs
const promptIds = messages.map(m => m.prompt).filter(Boolean);
const genAiIds = messages.map(m => m.aiResponse).filter(Boolean);

// 3️⃣ Delete Prompts
if (promptIds.length > 0) {
  const promptResult = await Prompt.deleteMany({ _id: { $in: promptIds } });
  console.log(`🔹 Prompts deleted: ${promptResult.deletedCount}`);
}

// 4️⃣ Delete GenAiResponses
if (genAiIds.length > 0) {
  const genAiResult = await GenAiResponseModel.deleteMany({ _id: { $in: genAiIds } });
  console.log(`🔹 GenAiResponses deleted: ${genAiResult.deletedCount}`);
}

// 5️⃣ Delete Messages
if (allMessageIds.length > 0) {
  const messageResult = await Message.deleteMany({ _id: { $in: allMessageIds } });
  console.log(`🔹 Messages deleted: ${messageResult.deletedCount}`);
}
 
}

  // 6️⃣ Delete Chats
  if (chatsToDelete.length > 0) {
    await Chat.deleteMany({ _id: { $in: chatsToDelete }, investorId });
    console.log("🔹 Chats deleted from DB");
  }

  // 7️⃣ Update History DB & Redis
  const dbHistory = await History.findOne({ investorId });
  if (dbHistory) {
 dbHistory.chats = dbHistory.chats.filter((c: string | Types.ObjectId) =>
  !chatsToDelete.some((tc: Types.ObjectId) => tc.toString() === c.toString())
);
    await dbHistory.save();
    console.log("🔹 History DB updated:", dbHistory.chats);

    const redisHistory: RedisHistoryObj = {
      _id: dbHistory._id.toString(),
      investorId,
      chats:dbHistory.chats.map((c: string | Types.ObjectId) => c?.toString() || ""),
    };
    await redis.set(redisKey, JSON.stringify(redisHistory));
    await redis.expire(redisKey, 86400);
    console.log("🔹 Redis updated:", redisHistory);
  }


   if (newActiveChatId) {
      const activeKey = `chat:${investorId}:active`;
      await redis.set(activeKey, JSON.stringify({ chatId: newActiveChatId }));
      console.log("🔹 New active chat set in Redis:", newActiveChatId);
    }
  

  console.log("🚀 DeleteChat | Completed successfully");
  return new ApiResponse(
    200,
    null,
    deleteAll ? "All chats deleted successfully" : "Chat deleted successfully"
  );
};

