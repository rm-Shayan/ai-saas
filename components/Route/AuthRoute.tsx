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

  const fetchingRef = useRef(false); // prevent multiple getUser calls on re-render
  const hasCheckedRef = useRef(false); // run only once on mount

  useEffect(() => {
    // Already checked or already logged in
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkAuth = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      // If already logged in -> redirect immediately
      if (authenticator?._id) {
        router.replace("/Chat");
        return;
      }

      try {
        // Attempt to get user (silent - no toast on failure)
        await dispatch(getUser()).unwrap();
        router.replace("/Chat");
      } catch {
        try {
          // Silent token refresh
          await dispatch(refreshToken()).unwrap();
          await dispatch(getUser()).unwrap();
          router.replace("/Chat");
        } catch {
          // All fails -> stay on auth page
          dispatch(logout());
        }
      } finally {
        fetchingRef.current = false;
      }
    };

    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount - not on every re-render

  /* ---------------- Silent token refresh interval while on auth page ---------------- */
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!authenticator?._id) return;

      try {
        await dispatch(refreshToken()).unwrap();
      } catch {
        dispatch(logout());
        router.replace("/login");
      }
    }, 14 * 60 * 1000); // refresh before expiry

    return () => clearInterval(interval);
  }, [dispatch, authenticator?._id, router]);

  // Always render login/signup pages immediately
  return <>{children}</>;
};

export default AuthRoute;