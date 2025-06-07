"use client";
import { useEffect, useCallback } from "react";
import { useAppSelector } from "@/hooks/useReduxType";
import { ConnectionState } from "@/types/ChatType";
import {
  checkSocketHealth,
  forceReconnect,
  isSocketReallyConnected,
} from "@/lib/socket";
import { messageQueue } from "@/lib/messageQueue";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/config";

export function useConnectionRecovery() {
  const connectionState = useAppSelector((state) => state.chat.connectionState);
  const queryClient = useQueryClient();

  const retryPendingMessages = useCallback(async () => {
    if (
      connectionState === ConnectionState.CONNECTED &&
      isSocketReallyConnected()
    ) {
      console.log("Connection restored, retrying pending messages...");

      await messageQueue.retryFailedMessages(async (message) => {
        try {
          console.log("Retrying message:", message.content);
          return true;
        } catch (error) {
          console.error("Failed to retry message:", error);
          return false;
        }
      });
    }
  }, [connectionState]);

  const performConnectionRecovery = useCallback(async () => {
    if (connectionState === ConnectionState.CONNECTED) {
      const isHealthy = await checkSocketHealth();

      if (!isHealthy) {
        console.warn("Connection appears stale, forcing reconnection...");
        forceReconnect();
        return;
      }
    }

    if (connectionState === ConnectionState.CONNECTED) {
      console.log("Connection confirmed healthy, refreshing data...");

      queryClient.invalidateQueries({
        queryKey: queryKeys.chats.infinite(20),
      });
      await retryPendingMessages();
    }
  }, [connectionState, queryClient, retryPendingMessages]);

  useEffect(() => {
    if (connectionState === ConnectionState.CONNECTED) {
      const timeout = setTimeout(performConnectionRecovery, 2000);
      return () => clearTimeout(timeout);
    }
  }, [connectionState, performConnectionRecovery]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && connectionState === ConnectionState.CONNECTED) {
        setTimeout(performConnectionRecovery, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [connectionState, performConnectionRecovery]);

  return {
    performConnectionRecovery,
    retryPendingMessages,
  };
}
