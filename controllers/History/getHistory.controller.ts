// import { NextRequest } from "next/server";
// import { ApiError } from "@/lib/api/ApiError";
// import { ApiResponse } from "@/lib/api/ApiResponse";
// import { redis } from "@/lib/db-config/db";
// import { History } from "@/models/history.model";

// export const GetHistory = async (req: NextRequest) => {
//   try {
//     const investorId = req.headers.get("x-temp-user-id");
//     if (!investorId) throw new ApiError(400, "Investor ID missing");

//     const redisKey = `history:${investorId}`;

//     // 1️⃣ Get from Redis
//     let historyDoc: any = null;
//     const cached = await redis.get(redisKey);

//     if (cached) {
//       historyDoc = JSON.parse(cached) as any;
//     } else {
//       // 2️⃣ Redis miss → Fetch from DB
//       const dbHistory = await History.findOne({ investorId });

//       if (!dbHistory) {
//         // Create new history if missing
//         const newHistory = await History.create({
//           investorId,
//           chats: []
//         });

//         historyDoc = {
//           _id: newHistory._id.toString(),
//           investorId,
//           title: newHistory.title,
//           chats: []
//         };

//         await redis.set(redisKey, JSON.stringify(historyDoc));
//       } else {
//         historyDoc = {
//           _id: dbHistory._id.toString(),
//           investorId: dbHistory.investorId.toString(),
//           title: dbHistory.title,
//           chats: dbHistory.chats.map((c) => c.toString())
//         };

//         await redis.set(redisKey, JSON.stringify(historyDoc));
//       }
//     }

//     // 3️⃣ If empty chats → return empty
//     if (!historyDoc.chats.length) {
//       return ApiResponse(
        
//         {
//           ...historyDoc,
//           chats: []
//         },
//         "History fetched"
//       );
//     }

//     // 4️⃣ Now aggregate Chats based on Redis chatIds
//     const chats = await History.aggregate([
//       {
//         $match: { _id: historyDoc._id }
//       },
//       {
//         $project: {
//           chats: historyDoc.chats.map((id) => new Types.ObjectId(id))
//         }
//       },
//       {
//         $unwind: "$chats"
//       },
//       {
//         $lookup: {
//           from: "chats",
//           localField: "chats",
//           foreignField: "_id",
//           as: "chat"
//         }
//       },
//       { $unwind: "$chat" },

//       // lookup: aiResponse
//       {
//         $lookup: {
//           from: "genairesponses",
//           localField: "chat.aiResponse",
//           foreignField: "_id",
//           as: "aiResponse"
//         }
//       },
//       { $unwind: { path: "$aiResponse", preserveNullAndEmptyArrays: true } },

//       // lookup: prompt
//       {
//         $lookup: {
//           from: "prompts",
//           localField: "chat.prompt",
//           foreignField: "_id",
//           as: "prompt"
//         }
//       },
//       { $unwind: { path: "$prompt", preserveNullAndEmptyArrays: true } },

//       {
//         $project: {
//           _id: "$chat._id",
//           createdAt: "$chat.createdAt",
//           title: "$chat.title",
//           prompt: "$prompt",
//           aiResponse: "$aiResponse"
//         }
//       }
//     ]);

//     return ApiResponse.success(
//       {
//         ...historyDoc,
//         chats
//       },
//       "History fetched"
//     );
//   } catch (err: any) {
//     throw new ApiError(500, err.message);
//   }
// };
