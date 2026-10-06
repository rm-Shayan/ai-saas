// utils/sanitizeUser.ts
import { IInvestorDocument } from "@/types/model.types";

export function sanitizeUser(user: IInvestorDocument | any) {
  const id = (user?._id || user?.id)?.toString() || "";
  return {
    _id: id,
    id: id,
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    companyName: user?.companyName || "",
    verified: user?.verified || false,
    avatar: user?.avatar?.url || (typeof user?.avatar === "string" ? user.avatar : null),
  };
}
