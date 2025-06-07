"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/useReduxType";
import { TERMINATE_SOCKET } from "@/lib/redux/chatSocketActions";
import { ConnectionState } from "@/types/ChatType";
import { useEffect, useRef } from "react";
import { useOnlineStatusSync } from "@/hooks/useOnlineStatusSync";
import { useConnectionRecovery } from "@/hooks/useConnectionRecovery";

export default function SocketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.user.token);
  const connectionState = useAppSelector(
    (state) => state.connection.connectionState
  );
  const hasInitialized = useRef(false);

  const { forceReconnection } = useOnlineStatusSync();
  useConnectionRecovery();

  useEffect(() => {
    if (
      token &&
      !hasInitialized.current &&
      connectionState === ConnectionState.DISCONNECTED
    ) {
      forceReconnection();
    }
    if (!token) {
      hasInitialized.current = false;
    }
  }, [token, connectionState, forceReconnection]);

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
