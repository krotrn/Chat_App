"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/useReduxType";
import {
  INITIALIZE_SOCKET,
  TERMINATE_SOCKET,
} from "@/lib/redux/chatSocketActions";
import { ConnectionState } from "@/types/ChatType";
import { useEffect, useRef } from "react";

export default function SocketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.user.token);
  const connectionState = useAppSelector((state) => state.chat.connectionState);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (
      token &&
      !hasInitialized.current &&
      connectionState === ConnectionState.DISCONNECTED
    ) {
      dispatch({ type: INITIALIZE_SOCKET, payload: { token } });
      hasInitialized.current = true;
    }
    if (!token) {
      hasInitialized.current = false;
    }
  }, [token, connectionState, dispatch]);

  useEffect(() => {
    return () => {
      if (hasInitialized.current && !token) {
        dispatch({ type: TERMINATE_SOCKET });
        hasInitialized.current = false;
      }
    };
  }, [dispatch, token]);

  return <>{children}</>;
}
