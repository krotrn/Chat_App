export interface ConnectionRecoveryState {
  isRecovering: boolean;
  lastRecoveryAttempt: Date | null;
  recoveryAttempts: number;
}

export interface ConnectionHealthConfig {
  healthCheckInterval: number;
  maxRecoveryAttempts: number;
  recoveryDelay: number;
  staleConnectionThreshold: number;
}

export interface ConnectionRecoveryHookReturn {
  performConnectionRecovery: () => Promise<void>;
  isRecovering: boolean;
}
