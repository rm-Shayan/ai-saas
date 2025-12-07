import { Schema, model, models } from "mongoose";

// History schema: tracks all chat sessions of an investor
const HistorySchema = new Schema(
  {
    investorId: {
      type: Schema.Types.ObjectId,
      ref: "Investor",
      required: true,
      index: true, // fast lookup per investor
    },
    title: {
      type: String,
      default: "Chat History",
    },
    // Array of chat references
    chats: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    // Optional: quick access to last chat
    lastChat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  { timestamps: true }
);

// Optional: compound index for faster queries
HistorySchema.index({ investorId: 1, updatedAt: -1 });

export const History = models.History || model("History", HistorySchema);
