interface ApiResponseProps<T = unknown> {
  statusCode: number;
  data?: T | null;
  message?: string;
  success?: boolean;
}

class ApiResponse<T = unknown> {
  public readonly statusCode: number;
  public readonly data: T | null;
  public readonly message: string;
  public readonly success: boolean;

  constructor({
    statusCode,
    data = null,
    message = "Success",
    success
  }: ApiResponseProps<T>) {
    this.statusCode = statusCode;
    this.data = data ?? null;
    this.message = message;
    this.success = success ?? (statusCode >= 200 && statusCode < 300);
  }

  // Standardized serialization format
  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      success: this.success
    };
  }
}

export { ApiResponse };