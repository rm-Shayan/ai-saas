import { Message } from "@/models/Messages.model";
import { RedisChatObj } from "./chat.service";
import { Types } from "mongoose";

export async function hydrateChat(redisChat: RedisChatObj) {
  // Convert IDs → ObjectId[]
  const messageIds = redisChat.messages.map(
    (id) => new Types.ObjectId(id)
  );

  const fullMessages = await Message.aggregate([
    {
      $match: {
        _id: { $in: messageIds },
      },
    },

    // Ensure messages remain in original order
    { $sort: { createdAt: 1 } },

    // Attach Prompt
    {
      $lookup: {
        from: "prompts",
        localField: "prompt",
        foreignField: "_id",
        as: "prompt",
      },
    },
    { $unwind: "$prompt" },

    // Attach Gen Ai Response
    {
      $lookup: {
        from: "genairesponses",
        localField: "aiResponse",
        foreignField: "_id",
        as: "aiResponse",
      },
    },
    { $unwind: "$aiResponse" },
  ]);

  return {
    ...redisChat,
    messages: fullMessages,
  };
}

