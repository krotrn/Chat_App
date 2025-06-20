import { getSocket } from "./connection";
import { SocketHealthCheckRequest, SocketHealthCheckResponse } from "@/types";

export function performHealthCheck(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = getSocket();

    if (!socket || !socket.connected) {
      resolve(false);
      return;
    }

    const timeout = setTimeout(() => {
      console.warn("Socket health check timeout - connection might be stale");
      resolve(false);
    }, 5000);

    const healthCheckData: SocketHealthCheckRequest = { timestamp: Date.now() };

    socket.emit(
      "ping",
      healthCheckData,
      (response: SocketHealthCheckResponse) => {
        clearTimeout(timeout);
        if (response && response.timestamp) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
    );
  });
}

export function forceReconnection(): void {
  const socket = getSocket();
  if (socket) {
    console.log("Forcing socket disconnection and reconnection");
    socket.disconnect();
    socket.connect();
  }
}
