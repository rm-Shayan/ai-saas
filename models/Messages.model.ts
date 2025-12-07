import { Schema, model, models, Types } from "mongoose";

const messageSchema = new Schema(
  {
    investorId: { type: Schema.Types.ObjectId, ref: "Investor", required: true },
    chatId: { type:  Schema.Types.ObjectId,ref: "Chat", required: true }, // unique per conversation
    prompt: { type: Schema.Types.ObjectId, ref: "Prompt", required: true },
    aiResponse: { type: Schema.Types.ObjectId, ref: "GenAiResponse", required: true },
  },
  { timestamps: true }
);

export const Message = models.Message || model("Message", messageSchema);
