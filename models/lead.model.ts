import mongoose, { Schema } from "mongoose";

export interface ILead {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  investmentRange?: string;
  startupName?: string;
  startupUrl?: string;
  chatId?: string;
  notes?: string;
}

export interface ILeadDocument extends ILead, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILeadDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    investmentRange: { type: String, trim: true },
    startupName: { type: String, trim: true },
    startupUrl: { type: String, trim: true },
    chatId: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const LeadModel = mongoose.models.Lead || mongoose.model<ILeadDocument>("Lead", LeadSchema);
