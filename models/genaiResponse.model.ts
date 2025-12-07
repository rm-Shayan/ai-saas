import mongoose, { Schema, model, models } from "mongoose";
import { GenAiResponseDoc } from "@/types/model.types";

const GenAiResponseSchema = new Schema<GenAiResponseDoc>(
  {

    responseType: {
      type: String,
      enum: ["general", "investment"],
      required: true,
    },
    text: { type: String,   required: true  },
    component: { type: Schema.Types.Mixed, default: null },
    chartValues: { type: Schema.Types.Mixed, default: {} },
    investorURL: { type: String, default: "" },
    additionalInfo: { type: String, default: "" },
    investorID:{
      type:mongoose.Types.ObjectId,
      refrance:"Investor",
      required:true,
    }
  },
  {
    timestamps: true, // createdAt aur updatedAt automatic
  }
);

// Model export
export const GenAiResponseModel =
  models.GenAiResponse || model<GenAiResponseDoc>("GenAiResponse", GenAiResponseSchema);
