"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "react-hot-toast"; // ✅ Import Toaster
import { resetPassword } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const authenticator = useSelector(
    (state: RootState) => state.auth.authenticator
  );
  const auth = useSelector(
    (state: RootState) => state.auth
  );

  // Redirect if already logged in
  useEffect(() => {
    if (authenticator?._id) {
      router.push("/dashboard");
    }
  }, [authenticator, router]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!token) {
    toast.error("Invalid or missing token");
    return;
  }

  setLoading(true);
  try {
    console.log("password", password);

    // ✅ Use 'newPassword' instead of 'password'
    const result = await dispatch(resetPassword({ token, newPassword:password })).unwrap();

    console.log(result);

    toast.success("Password reset successfully!");
    setPassword("");
    router.push("/login");
  } catch (err: any) {
    toast.error(err?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-blue-600">
          Reset Password
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
