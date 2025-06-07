"use client";

import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/useReduxType";
import { ConnectionState } from "@/types/ChatType";
import { ConnectionRecoveryService } from "../features/connection-recovery/services/connectionRecoveryService";
import type { ConnectionRecoveryHookReturn } from "../features/connection-recovery/types";

export function useConnectionRecovery(): ConnectionRecoveryHookReturn {
  const connectionState = useAppSelector(
    (state) => state.connection.connectionState
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
        lastActiveRef.current
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

  // Start periodic health checks
  useEffect(() => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }

    healthCheckIntervalRef.current = setInterval(async () => {
      await ConnectionRecoveryService.performPeriodicHealthCheck(
        connectionState
      );
    }, 30000); // Every 30 seconds

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
