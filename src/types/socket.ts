export interface SocketConfig {
  apiUrl: string;
  token: string;
  maxReconnectAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
}

export interface SocketEventCallback<T = unknown> {
  (data: T): void;
}

export interface SocketEmitData<T = unknown> {
  event: string;
  data?: T;
  callback?: (response: T) => void;
}

export interface SocketHealthCheckResponse {
  timestamp: number;
  serverTime?: number;
}

export interface SocketHealthCheckRequest {
  timestamp: number;
}
