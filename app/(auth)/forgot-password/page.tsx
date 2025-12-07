"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/store/slices/authSlice";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { CheckCircle } from "lucide-react"; // Success icon

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLinkSent, setIsLinkSent] = useState(false); 

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const authenticator = useSelector(
    (state: RootState) => state.auth.authenticator
  );

  // Redirect if already logged in
  useEffect(() => {
    if (authenticator?._id) {
      router.push("/dashboard");
    }
  }, [authenticator, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setIsLinkSent(true); 

    } catch (error: any) {
      console.error("Forgot Password Error:", error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-600">
          Forgot Password
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || isLinkSent}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || isLinkSent}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Remembered your password?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>

      {/* -------------------- SUCCESS MESSAGE OVERLAY (Enhanced Blur) -------------------- */}
      {isLinkSent && (
        <div 
          // ✅ FIX: Changed background to a subtle white/dark grey opacity and increased blur
          className="fixed inset-0 z-50 flex items-center justify-center **bg-white/30 dark:bg-gray-900/50 backdrop-blur-md**"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-10 max-w-lg w-full text-center transform transition-all scale-100 duration-300">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Success!
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Password **Reset Link Sent Successfully!** Please check your email inbox (and spam folder).
            </p>
          <Button
  onClick={() => window.open("https://mail.google.com", "_blank")}
  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
>
  Go to Gmail
</Button>
          </div>
        </div>
      )}
    </div>
  );
}