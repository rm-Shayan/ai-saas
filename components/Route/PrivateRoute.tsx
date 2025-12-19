"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { refreshToken, getUser, logout } from "@/store/slices/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { authenticator } = useSelector((state: RootState) => state.auth);
  const refreshingRef = useRef(false); // prevent multiple refresh
  const fetchingRef = useRef(false);   // prevent multiple getUser calls

  /* ---------------- Initial Auth Check ---------------- */
  useEffect(() => {
    const initAuth = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        // Try getting the user
        await dispatch(getUser()).unwrap();
      } catch {
        try {
          // Try silent refresh
          await dispatch(refreshToken()).unwrap();
          await dispatch(getUser()).unwrap();
        } catch {
          // Logout and redirect if all fails
          dispatch(logout());
          router.replace("/login");
        }
      }
    };

    initAuth();
  }, [dispatch, router]);

  /* ---------------- Silent Token Refresh ---------------- */
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!authenticator?._id || refreshingRef.current) return;

      refreshingRef.current = true;
      try {
        await dispatch(refreshToken()).unwrap();
      } catch {
        dispatch(logout());
        router.replace("/login");
      } finally {
        refreshingRef.current = false;
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch, authenticator?._id, router]);

  /* ---------------- Render ---------------- */
  // Render children immediately — page won't be stuck
  return <>{children}</>;
};

export default PrivateRoute;
