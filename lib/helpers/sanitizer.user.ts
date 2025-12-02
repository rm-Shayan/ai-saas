// utils/sanitizeUser.ts
import { IInvestorDocument } from "@/types/model.types";

export function sanitizeUser(user: IInvestorDocument) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    companyName: user.companyName,
    verified: user.verified,
    avatar: user.avatar || null,
  };
}
