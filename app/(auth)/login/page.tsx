"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { RootState, AppDispatch } from "@/store/store";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useDispatch,useSelector } from "react-redux";
import { loginUser } from "@/store/slices/authSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      console.log(result)

      // 🔹 Login success
      toast.success(`Welcome back, ${result.name || authenticator?.name} !`);

      // Redirect to dashboard
      router.push("/Chat/123");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-blue-600 text-center">InvestoCrafy</h1>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          AI-powered investment advisor. Log in to access insights.
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div className="flex justify-between items-center text-sm text-blue-600 dark:text-blue-400">
            <a href="/forgot-password" className="hover:underline">
              Forgot password?
            </a>
            <a href="/signup" className="hover:underline">
              Sign up
            </a>
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
