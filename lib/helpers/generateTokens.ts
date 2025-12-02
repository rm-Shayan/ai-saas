// utils/generateTokens.ts

import { IInvestorDocument } from "@/types/model.types";

export  async function generateTokens(investor: IInvestorDocument) {
  const accessToken = investor.generateAccessToken();
  const refreshToken = investor.generateRefreshToken();

  if (!accessToken || !refreshToken) {
    throw new Error("Failed to generate authentication tokens.");
  }

  await investor.save()
  return { accessToken, refreshToken };
}
