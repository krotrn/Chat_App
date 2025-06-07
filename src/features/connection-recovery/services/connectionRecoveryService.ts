import { emitUserOnline } from "@/features/socket/events";
import {
  forceReconnection,
  performHealthCheck,
} from "@/features/socket/health";
import { ConnectionState } from "@/types/ChatType";
import { ConnectionHealthConfig } from "../types";

export class ConnectionRecoveryService {
  private static defaultConfig: ConnectionHealthConfig = {
    healthCheckInterval: 30000, // 30 seconds
    maxRecoveryAttempts: 3,
    recoveryDelay: 2000, // 2 seconds
    staleConnectionThreshold: 300000, // 5 minutes
  };

  static async performRecovery(
    connectionState: ConnectionState
  ): Promise<boolean> {
    if (connectionState === ConnectionState.CONNECTED) {
      const isHealthy = await performHealthCheck();
      if (!isHealthy) {
        console.log("Connection unhealthy, forcing reconnection");
        forceReconnection();
        return false;
      }
      emitUserOnline();
      return true;
    }
    return false;
  }

  static async handleVisibilityChange(
    connectionState: ConnectionState,
    lastActiveTime: number
  ): Promise<void> {
    if (!document.hidden) {
      const timeSinceLastActive = Date.now() - lastActiveTime;

      if (timeSinceLastActive > this.defaultConfig.staleConnectionThreshold) {
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
    }
  }

  static async handleOnlineStatusChange(): Promise<void> {
    if (navigator.onLine) {
      console.log("Browser back online, checking socket connection");
      await new Promise((resolve) =>
        setTimeout(resolve, this.defaultConfig.recoveryDelay)
      );

      const isHealthy = await performHealthCheck();
      if (!isHealthy) {
        forceReconnection();
      }
    }
  }

  static async performPeriodicHealthCheck(
    connectionState: ConnectionState
  ): Promise<void> {
    if (connectionState === ConnectionState.CONNECTED) {
      const isHealthy = await performHealthCheck();
      if (!isHealthy) {
        console.log("Periodic health check failed, forcing reconnection");
        forceReconnection();
      }
    }
  }
}
