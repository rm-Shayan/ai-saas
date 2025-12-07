import { Schema, model, models } from "mongoose";

const PromptSchema = new Schema(
  {
    investorId: {
      type: Schema.Types.ObjectId,
      ref: "Investor",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Prompt =
  models.Prompt || model("Prompt", PromptSchema);
