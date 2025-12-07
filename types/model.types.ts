import { Document,Types } from "mongoose";

export interface IInvestorFields {
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  companyName?: string;
  phone?: string;
  verified?: boolean; // OTP verified flag

  avatar?: {
    url: string;
    public_id: string;
  };
}

export interface IInvestorDocument extends IInvestorFields, Document {
  comparePassword(enteredPassword: string): Promise<boolean>;
  generateRefreshToken(): string;
  generateAccessToken(): string;
  createdAt: Date;
  updatedAt: Date;
}



export type ResponseType = "general" | "investment";

export interface IGenAiResponse {
  responseType: ResponseType;
  text: string;
  component: any; // JSX JSON tree or empty string in fallback
  chartValues: Record<string, any>;
  investorURL: string;
  additionalInfo: string;
}

// Ye interface Document ko extend kar rahi hai, aur _id type specify hai
export interface GenAiResponseDoc extends IGenAiResponse, Document {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  investorID?:String;
}