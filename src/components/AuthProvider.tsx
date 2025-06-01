"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { setAuth, clearAuth } from "@/lib/redux/slices/user-slice";
import { useAppDispatch } from "@/hooks/useReduxType";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (status === "authenticated" && session?.accessToken) {
      dispatch(
        setAuth({
          token: session.accessToken,
          user: session.user,
        }),
      );
    } else if (status === "unauthenticated") {
      dispatch(clearAuth());
    }
  }, [session, status, dispatch]);

  return <>{children}</>;
}
