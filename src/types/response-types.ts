export interface ActionResponse<T = unknown> {
  success: boolean;
  error: boolean;
  data?: T;
  message: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
}

export interface HealthCheckResponse {
  status: "ok" | "error";
  message: string;
}

export interface FileUploadResponse {
  url: string;
  publicId: string;
  resourceType: string;
  size: number;
}

export const createSuccessResponse = <T>(
  data: T,
  message: string = "Operation completed successfully",
): ActionResponse<T> => ({
  success: true,
  error: false,
  data,
  message,
});

export const createErrorResponse = (
  message: string = "An error occurred",
): ActionResponse => ({
  success: false,
  error: true,
  message,
});

export const createAuthResponse = (
  success: boolean,
  message: string,
): AuthResponse => ({
  success,
  message,
});

export const createHealthResponse = (
  status: "ok" | "error",
  message: string,
): HealthCheckResponse => ({
  status,
  message,
});
