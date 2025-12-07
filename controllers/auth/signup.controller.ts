import Investor from "@models/inevstor.model";
import { ApiError } from "@/lib/api/ApiError";
import { ApiResponse } from "@/lib/api/ApiResponse";
import { NextRequest } from "next/server";
import { redis } from "@/lib/db-config/db"; // Redis client
import { generateOTP } from "@/lib/helpers/otp";
import { sendMail } from "@/lib/helpers/email";

// ---------------- SIGNUP ----------------
export const signUpUser = async (req: NextRequest) => {
  const body = await req.json();
  const { name, email, password, companyName, phone } = body;

  // Validate input
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  // Check if investor already exists
  const existing = await Investor.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Investor already exists");
  }

  // Generate OTP and store in Redis
 const otp = generateOTP(6);
const redisKey = `signup_otp:${email}`;
await redis.set(redisKey, otp, { ex: 300 }); // 5 min TTL

// Run email send & DB create in parallel
const investorPromise = Investor.create({
  name,
  email,
  password,
  companyName,
  phone,
});

const emailPromise = sendMail({
  from: process.env.SMTP_SERVER_USERNAME!, // sender
  to: email,                               // receiver
  subject: "Your Signup OTP",
  text: `Hello ${name}, your OTP code is: ${otp}`,
  html: `<p>Hello <strong>${name}</strong>,</p><p>Your OTP code is: <strong>${otp}</strong></p>`,
});

const [investor] = await Promise.all([investorPromise, emailPromise]);

return new ApiResponse(201, { email }, "Investor created, OTP sent to email");


};
