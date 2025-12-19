"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser, refreshToken, logout } from "@/store/slices/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute = ({ children }: AuthRouteProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { authenticator } = useSelector((state: RootState) => state.auth);

  const fetchingRef = useRef(false); // prevent multiple getUser calls
  const refreshingRef = useRef(false); // prevent multiple refreshToken calls

  useEffect(() => {
    const checkAuth = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      // If already logged in → redirect
      if (authenticator?._id) {
        router.replace("/Chat");
        return;
      }

      try {
        // Attempt to get user
        await dispatch(getUser()).unwrap();
        router.replace("/Chat");
      } catch {
        try {
          // Silent token refresh
          await dispatch(refreshToken()).unwrap();
          await dispatch(getUser()).unwrap();
          router.replace("/Chat");
        } catch {
          // All fails → stay on auth page
          dispatch(logout());
        }
      } finally {
        fetchingRef.current = false;
      }
    };

    checkAuth();
  }, [dispatch, authenticator?._id, router]);

  /* ---------------- Optional: silent token refresh while on auth page ---------------- */
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
    }, 14 * 60 * 1000); // refresh before expiry

    return () => clearInterval(interval);
  }, [dispatch, authenticator?._id, router]);

  // Always render login/signup pages immediately
  return <>{children}</>;
};

export default AuthRoute;
