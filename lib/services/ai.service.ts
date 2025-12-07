import { GenAi } from "@/lib/genai/genai";
import { ApiError } from "@/lib/api/ApiError";
import { GenAiResponseModel } from "@/models/genaiResponse.model";
import { Types } from "mongoose";
import { GenAiResponseDoc } from "@/types/model.types";


export async function processAiResponse(
  promptText: string,
  investorId: string
): Promise<GenAiResponseDoc> {
  const rawAiResult = await GenAi(promptText);

  let aiResult: Partial<GenAiResponseDoc> = {};

  try {
    aiResult = typeof rawAiResult === "string"
      ? JSON.parse(rawAiResult)
      : rawAiResult;
  } catch (err) {
    aiResult = {
      responseType: "investment",
      text: "AI parsing failed.",
      component: "",
      investorURL: "",
    };
  }

  if (!aiResult?.text) {
    throw new ApiError(500, "AI response empty");
  }

  const savedAI = await GenAiResponseModel.create({
    ...aiResult,
    investorID: new Types.ObjectId(investorId)
  });

  // Type assertion to IGenAiResponse
  return savedAI as unknown as GenAiResponseDoc;
}
