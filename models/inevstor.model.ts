import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IInvestorDocument } from "@/types/model.types"; // Correct path

// ------------------------------
// SCHEMA
// ------------------------------
const InvestorSchema = new Schema<IInvestorDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: "" },
    companyName: { type: String },
    phone: { type: String },
    verified: { type: Boolean, default: false },

    avatar: {
      url: {
        type: String,
        default:null,
      },
      public_id: {
        type: String,
        default: null,
      },
    },
  },
  { timestamps: true }
);

// ------------------------------
// PRE-SAVE HOOK: HASH PASSWORD
// ------------------------------
InvestorSchema.pre<IInvestorDocument>("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ------------------------------
// INSTANCE METHODS
// ------------------------------
InvestorSchema.methods.comparePassword =async function (enteredPassword: string) {
  return await  bcrypt.compare(enteredPassword, this.password);
};

InvestorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" }
  );
};

InvestorSchema.methods.generateRefreshToken = function () {
  const token = jwt.sign(
    { id: this._id, email: this.email },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );
  this.refreshToken = token;
  return token;
};

// ------------------------------
// EXPORT MODEL
// ------------------------------
export default mongoose.models.Investor ||
  mongoose.model<IInvestorDocument>("Investor", InvestorSchema);
