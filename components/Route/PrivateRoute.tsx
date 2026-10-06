"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { getUser, refreshToken, logout } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store/store";
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
        // Direct getUser: single API call, populates Redux auth state immediately
        const user = await dispatch(getUser()).unwrap();
        const userId = (user as any)?._id || (user as any)?.id;
        if (userId) {
          setAuthChecked(true);
          return;
        }

        // Silent token refresh attempt if initial getUser returned empty
        try {
          await dispatch(refreshToken()).unwrap();
          const retryUser = await dispatch(getUser()).unwrap();
          const retryId = (retryUser as any)?._id || (retryUser as any)?.id;
          if (retryId) {
            setAuthChecked(true);
            return;
          }
        } catch {}

        setRedirecting(true);
        dispatch(logout());
        router.replace("/login");
      } catch {
        // Silent token refresh on 401 error
        try {
          await dispatch(refreshToken()).unwrap();
          const retryUser = await dispatch(getUser()).unwrap();
          const retryId = (retryUser as any)?._id || (retryUser as any)?.id;
          if (retryId) {
            setAuthChecked(true);
            return;
          }
        } catch {}

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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
