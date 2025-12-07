import { Prompt } from "@/models/prompt.model";
import { Types } from "mongoose";

export async function savePrompt(investorId: string, text: string) {
  return await Prompt.create({
    investorId: new Types.ObjectId(investorId),
    text
  });
}
