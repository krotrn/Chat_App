import axios from "axios";
import { config } from "@/config";
import { ApiResponse } from "@/types/ChatType";

export interface ApiErrorData {
  statusCode: number;
  errors?: string[];
}

let isConnectionIssue = false;

export const api = axios.create({
  baseURL: `${config.chatApiUrl}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const handleApiResponse = <T>(response: { data: ApiResponse<T> }): T => {
  if (!response.data) {
    throw new Error("No response data received");
  }

  if (!response.data.success) {
    const errorMessage = response.data.message || "API request failed";
    const error = new Error(errorMessage) as Error & ApiErrorData;
    error.statusCode = response.data.statusCode;
    error.errors = response.data.errors;
    throw error;
  }

  return response.data.data;
};

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export const handleApiError = (error: unknown): never => {
  console.log("API Error:", error);

  if (error instanceof Error) {
    console.log("Error message:", error.message);
    throw error;
  }

  throw new Error("An unknown error occurred");
};

api.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status, response.config.url);
    return response;
  },
  (error) => {
    if (!error.response) {
      console.log("Network error:", error.message);
      return Promise.reject(
        "No response received from server. Please check your connection."
      );
    } else if (error.response) {
      console.error(
        "Error response:",
        error.response.status,
        error.response.data
      );
      return Promise.reject(error.response.data);
    } else {
      console.error("Error message:", error.message);
      return Promise.reject(error);
    }
  }
);

export const isConnectionHealthy = (): boolean => {
  return !isConnectionIssue;
};

// Explicitly check connection health
export const checkConnectionHealth = async (): Promise<boolean> => {
  try {
    await api.get("/ping", {
      timeout: 3000,
    });

    isConnectionIssue = false;
    return true;
  } catch (error) {
    console.log("Connection health check failed:", error);
    isConnectionIssue = true;
    return false;
  }
};

export const ensureConnection = async (): Promise<boolean> => {
  if (isConnectionIssue) {
    const healthy = await checkConnectionHealth();
    if (!healthy) {
      console.warn("Connection is still unhealthy after re-check.");

      return false;
    }
  }
  return true;
};

export const withConnectionCheck = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  const isConnected = await ensureConnection();
  if (!isConnected) {
    console.warn("Proceeding with API call despite connection issue warning.");
  }
  return apiCall();
};
