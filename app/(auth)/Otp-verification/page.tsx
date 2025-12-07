"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { verifyOtp, resetOtp } from "@/store/slices/authSlice";

export default function OtpVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const authenticator = useSelector(
    (state: RootState) => state.auth.authenticator
  );
  const auth = useSelector((state: RootState) => state.auth);

  // If user already logged in → redirect
  useEffect(() => {
    if (authenticator?._id) {
      router.push("/dashboard");
    }
  }, [authenticator, router]);

  // Get email from URL query ?email=
  useEffect(() => {
    const paramEmail = searchParams.get("email");

    if (paramEmail) {
      setEmail(paramEmail);
    } else {
      toast.error("Email not found. Redirecting...");
      router.push("/signup");
    }
  }, [searchParams, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(verifyOtp({ email, otp })).unwrap(); // <-- USE THUNK PROPERLY

      // If successful
      toast.success("OTP verified successfully!");

      router.push(`/login?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetOtp = async () => {
    try {
      // Use email from authenticator state
          console.log("hogya")
      const userEmail = authenticator?.email || email ;
        console.log (userEmail)
      if (!userEmail) return toast.error("Email not available");
    

      // Dispatch the resetOtp thunk
      await dispatch(resetOtp({ email: userEmail })).unwrap();

      // Show toast using state (authenticator.email)
      toast.success(`OTP has been sent to ${userEmail}`);
    } catch (error: any) {
      toast.error(error || "Failed to resend OTP");
    }


  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-600">
          OTP Verification
        </h2>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Enter the OTP sent to <strong>{email}</strong>
        </p>

        <form className="space-y-4" onSubmit={handleVerify}>
          <div>
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

  <p className="text-sm text-center text-gray-500 dark:text-gray-400" >
  Didn't receive the OTP?{" "}
 <button
  type="button"
  className="inline-block px-1 text-blue-600 hover:underline cursor-pointer"
  onClick={handleResetOtp}
>
  Resend
</button>
</p>

      </div>
    </div>
  );
}
