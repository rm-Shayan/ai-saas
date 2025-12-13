"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser, refreshToken } from "@/store/slices/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import Loading from "../../app/loading";

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { authenticator, loading } = useSelector(
    (state: RootState) => state.auth
  );

  // Track if auth check finished (success or fail)
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (authenticator?._id) {
        // User already in state → redirect
        router.replace("/Chat");
        setAuthChecked(true);
        return;
      }

      try {
        // 1️⃣ Try get user first
        await dispatch(getUser()).unwrap();
        router.replace("/Chat"); // Success → redirect
      } catch {
        console.warn("getUser failed, trying refreshToken...");

        try {
          // 2️⃣ Try refresh token
          await dispatch(refreshToken()).unwrap();

          // 3️⃣ If refresh success → get user again
          await dispatch(getUser()).unwrap();
          router.replace("/Chat"); // Success → redirect
        } catch (err2) {
          console.warn(
            "refreshToken or second getUser failed, user remains unauthenticated",
            err2
          );
          dispatch({ type: "auth/logout" });
          // ❌ No redirect → allow login/signup page to render
        }
      } finally {
        // ✅ Auth check finished
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [dispatch, authenticator?._id, router]);

  // Show loader until auth check finishes
  if (!authChecked || loading) {
    return <Loading />;
  }

  // ✅ Render login/signup or children based on authenticator
  return <>{children}</>;
};

export default AuthRoute;
