import { Schema, model, models, Types } from "mongoose";

// Scalable Chat schema with multiple messages per session
const ChatSchema = new Schema(
  {
    investorId: {
      type: Schema.Types.ObjectId,
      ref: "Investor",
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    // Array of messages for this chat session
    messages: [
   {
    type: Schema.Types.ObjectId,
      ref: "Message",
      required: true,
   }
    ],

    
  },
  { timestamps: true }
);

// Index for faster lookup of chats per investor
ChatSchema.index({ investorId: 1, updatedAt: -1 });

export const Chat = models.Chat || model("Chat", ChatSchema);
