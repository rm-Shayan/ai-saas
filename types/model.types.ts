import { Document } from "mongoose";

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
