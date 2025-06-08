"use client";

import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/hooks";
import { ConnectionRecoveryHookReturn, ConnectionState } from "@/types";
import { ConnectionRecoveryService } from "@/features/connection-recovery/connectionRecoveryService";

export function useConnectionRecovery(): ConnectionRecoveryHookReturn {
  const connectionState = useAppSelector(
    (state) => state.connection.connectionState,
  );
  const queryClient = useQueryClient();
  const lastActiveRef = useRef<number>(Date.now());
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const performConnectionRecovery = useCallback(async () => {
    await ConnectionRecoveryService.performRecovery(connectionState);

    if (connectionState === ConnectionState.CONNECTED) {
      queryClient.invalidateQueries();
    }
  }, [connectionState, queryClient]);

  useEffect(() => {
    if (connectionState === ConnectionState.CONNECTED) {
      performConnectionRecovery();
    }
  }, [connectionState, performConnectionRecovery]);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      await ConnectionRecoveryService.handleVisibilityChange(
        connectionState,
        lastActiveRef.current,
      );
      lastActiveRef.current = Date.now();
    };

    const handleOnlineChange = async () => {
      await ConnectionRecoveryService.handleOnlineStatusChange();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnlineChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnlineChange);
    };
  }, [connectionState]);

  useEffect(() => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }

    healthCheckIntervalRef.current = setInterval(async () => {
      await ConnectionRecoveryService.performPeriodicHealthCheck(
        connectionState,
      );
    }, 30000);

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [connectionState]);

  return {
    performConnectionRecovery,
    isRecovering: connectionState === ConnectionState.RECONNECTING,
  };
}
