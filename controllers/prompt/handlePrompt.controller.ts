"use server";

import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";

import { extractTextFromPdfBase64 } from "@/lib/services/pdf.service";
import { savePrompt } from "@/lib/services/prompt.service";
import { processAiResponse } from "@/lib/services/ai.service";
import { createMessage } from "@/lib/services/message.service";
import { resolveChat, attachMessageToChat } from "@/lib/services/chat.service";
import { updateUserHistory } from "@/lib/services/history.service";
import { GenAiResponseDoc } from "@/types/model.types";

export const handleUserPrompt = async (req: NextRequest) => {
  try {
    // 0️⃣ Header validation
    const investorId = req.headers.get("x-temp-user-id")?.trim();
    if (!investorId) throw new ApiError(400, "Missing investor id");

    // 1️⃣ Body validation
    const body = await req.json();
    if (!body) throw new ApiError(400, "Request body is required");

    // 2️⃣ Extract prompt text (text or PDF)
    let promptText = "";
    if (typeof body.prompt === "string" && body.prompt.trim()) {
      promptText = body.prompt.trim();
    } else if (typeof body.pdfBase64 === "string" && body.pdfBase64.trim()) {
      promptText = await extractTextFromPdfBase64(body.pdfBase64.trim());
      if (!promptText) throw new ApiError(400, "Cannot extract text from PDF");
    } else {
      throw new ApiError(400, "Either prompt or pdfBase64 is required");
    }

    // 3️⃣ Save Prompt
    const promptDoc = await savePrompt(investorId, promptText);

    // 4️⃣ Process AI response
    const aiResponse: GenAiResponseDoc = await processAiResponse(promptText, investorId);

    // 5️⃣ Resolve Chat (Redis + DB)
    const { chatDoc, redisObj, redisKey } = await resolveChat(
      investorId,
      body.chatId // optional for first message
    );

    // 6️⃣ Ensure chatId is always valid
    const chatIdToUse = body.chatId ?? chatDoc._id.toString();

    // 7️⃣ Create Message
    const messageDoc = await createMessage(
      investorId,
      promptDoc._id.toString(),
      aiResponse._id.toString(),
      chatIdToUse
    );

    // 8️⃣ Attach message to chat + update Redis
    const updatedRedis = await attachMessageToChat(chatDoc, messageDoc, redisObj, redisKey);

    // 9️⃣ Update user history (DB + Redis)
   console.log("🔹 Calling updateUserHistory with:", {
  investorId,
  chatId: chatDoc._id.toString(),
});

const history = await updateUserHistory(investorId, chatDoc._id.toString());

console.log("🔹 updateUserHistory returned:", history);

    // 🔟 Return structured response
    return new ApiResponse(
      200,
      {
        prompt: promptDoc,
        aiResponse,
        message: messageDoc,
        chat: chatDoc,
        redisChat: updatedRedis,
        history,
      },
      "Prompt processed and message attached successfully"
    );
  } catch (err: any) {
    console.error("handleUserPrompt error:", err);
    return new ApiResponse(
      err instanceof ApiError ? err.statusCode : 500,
      null,
      err.message || "Internal server error"
    );
  }
};
