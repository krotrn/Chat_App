"use client";
import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxType";
import { setConnectionState } from "@/lib/redux/slices/connection-slice";
import { ConnectionState } from "@/types/ChatType";
import { getSocket, emitUserOnline } from "@/lib/socket";
import { INITIALIZE_SOCKET } from "@/lib/redux/chatSocketActions";

/**
 * Custom hook to synchronize online status with the server.
 */

export function useOnlineStatusSync() {
  const dispatch = useAppDispatch();
  const connectionState = useAppSelector(
    (state) => state.connection.connectionState
  );
  const token = useAppSelector((state) => state.user.token);
  const lastActiveRef = useRef<number>(Date.now());
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const performHealthCheck = useCallback(async () => {
    const socket = getSocket();

    if (!socket || !token) return false;

    if (socket.connected) {
      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn(
            "Socket health check timeout - connection might be stale"
          );
          resolve(false);
        }, 5000);
        socket.emit(
          "ping",
          { timestamp: Date.now() },
          (response: { timestamp: number }) => {
            clearTimeout(timeout);
            if (response && response.timestamp) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        );
      });
    }
    return false;
  }, [token]);

  const forceReconnection = useCallback(() => {
    console.log("Forcing socket reconnection due to stale connection");
    const socket = getSocket();

    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      dispatch(setConnectionState(ConnectionState.DISCONNECTED));
      console.log("Socket disconnected, attempting to reconnect");
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (token) {
        dispatch({ type: INITIALIZE_SOCKET, payload: { token } });
      }
    }, 1000);
  }, [dispatch, token]);

  const handleVisibilityChange = useCallback(async () => {
    if (!document.hidden && token) {
      const timeSinceLastActive = Date.now() - lastActiveRef.current;

      if (timeSinceLastActive > 5 * 60 * 1000) {
        console.log(
          "User returned after being away, checking connection health"
        );

        const isHealthy = await performHealthCheck();
        if (!isHealthy) {
          forceReconnection();
        } else {
          emitUserOnline();
        }
      }

      lastActiveRef.current = Date.now();
    }
  }, [token, performHealthCheck, forceReconnection]);

  const handleOnlineOffline = useCallback(() => {
    if (navigator.onLine && token) {
      console.log("Browser back online, checking socket connection");
      setTimeout(async () => {
        const isHealthy = await performHealthCheck();
        if (!isHealthy) {
          forceReconnection();
        }
      }, 2000);
    }
  }, [token, performHealthCheck, forceReconnection]);

  const startHealthChecks = useCallback(() => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }

    healthCheckIntervalRef.current = setInterval(async () => {
      if (connectionState === ConnectionState.CONNECTED) {
        const isHealthy = await performHealthCheck();
        if (!isHealthy) {
          console.warn("Regular health check failed, forcing reconnection");
          forceReconnection();
        }
      }
    }, 30000);
  }, [connectionState, performHealthCheck, forceReconnection]);

  const stopHealthChecks = useCallback(() => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    if (connectionState === ConnectionState.CONNECTED) {
      startHealthChecks();
    } else {
      stopHealthChecks();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("online", handleOnlineOffline);
    window.addEventListener("offline", handleOnlineOffline);

    const updateLastActive = () => {
      lastActiveRef.current = Date.now();
    };

    document.addEventListener("mousedown", updateLastActive);
    document.addEventListener("keydown", updateLastActive);
    document.addEventListener("scroll", updateLastActive);
    document.addEventListener("touchstart", updateLastActive);

    return () => {
      stopHealthChecks();

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnlineOffline);
      window.removeEventListener("offline", handleOnlineOffline);
      document.removeEventListener("mousedown", updateLastActive);
      document.removeEventListener("keydown", updateLastActive);
      document.removeEventListener("scroll", updateLastActive);
      document.removeEventListener("touchstart", updateLastActive);
    };
  }, [
    token,
    connectionState,
    handleVisibilityChange,
    handleOnlineOffline,
    startHealthChecks,
    stopHealthChecks,
  ]);

  return {
    forceReconnection,
    performHealthCheck,
  };
}
