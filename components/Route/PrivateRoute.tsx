"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { getUser, logout } from "@/store/slices/authSlice";
import { RootState, AppDispatch } from "@/store/store";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const [authChecked, setAuthChecked] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const checkingRef = useRef(false);

  /* ---------------- Initial Auth Check ---------------- */
  useEffect(() => {
    const initAuth = async () => {
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        const res = await fetch("/api/auth/user", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          setAuthChecked(true);
          // populate redux auth state without triggering failing toasts
          try {
            await dispatch(getUser()).unwrap();
          } catch {}
          return;
        }

        // If user fetch failed, silently try to get a fresh token once
        try {
          await fetch("/api/auth/refresh-token", { method: "GET", credentials: "include" });
          const retry = await fetch("/api/auth/user", { method: "GET", credentials: "include" });
          if (retry.ok) {
            setAuthChecked(true);
            try {
              await dispatch(getUser()).unwrap();
            } catch {}
            return;
          }
        } catch {}

        setRedirecting(true);
        dispatch(logout());
        router.replace("/login");
      } catch {
        setRedirecting(true);
        dispatch(logout());
        router.replace("/login");
      }
    };

    initAuth();
  }, [dispatch, router]);

  /* ---------------- Fallback: do not render children until auth is confirmed ---------------- */
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          {redirecting ? (
            <p className="text-sm">Redirecting to login...</p>
          ) : (
            <p className="text-sm">Checking authentication...</p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
