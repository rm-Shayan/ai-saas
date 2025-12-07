import { Message } from "@/models/Messages.model";
import { Types } from "mongoose";

export async function createMessage(investorId: string, promptId: string, aiId: string, chatId?: string) {
  const payload: any = {
    investorId: new Types.ObjectId(investorId),
    prompt: new Types.ObjectId(promptId),
    aiResponse: new Types.ObjectId(aiId),
  };

  if (chatId) payload.chatId = new Types.ObjectId(chatId);

  return await Message.create(payload);
}
