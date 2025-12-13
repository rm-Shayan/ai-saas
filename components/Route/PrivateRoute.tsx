"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { refreshToken, getUser } from "@/store/slices/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import Loading from "../../app/loading";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { authenticator, loading, fetched } = useSelector(
    (state: RootState) => state.auth
  );

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (authenticator?._id || fetched) {
        // Already fetched once → skip API
        setAuthChecked(true);
        return;
      }

      try {
        // 1️⃣ Try get user
        await dispatch(getUser()).unwrap();
      } catch {
        try {
          // 2️⃣ Try refresh token
          await dispatch(refreshToken()).unwrap();

          // 3️⃣ If refresh success → get user again
          await dispatch(getUser()).unwrap();
        } catch {
          // ❌ Both failed → logout & redirect
          dispatch({ type: "auth/logout" });
          router.replace("/login");
        }
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [dispatch, authenticator?._id, fetched, router]);

  // 🔁 Auto refresh token every 15 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!authenticator?._id) return;

      try {
        await dispatch(refreshToken()).unwrap();
      } catch {
        dispatch({ type: "auth/logout" });
        router.replace("/login");
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch, router, authenticator?._id]);

  // ⏳ Show loader until auth check finishes
  if (!authChecked || loading) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
