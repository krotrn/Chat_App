interface ApiResponseProps<T = unknown> {
  statusCode: number;
  data?: T | null;
  message?: string;
  success?: boolean;
}

/**
 * Represents a standardized API response.
 *
 * @template T - The type of the data being returned in the response.
 */
class ApiResponse<T = unknown> {
  public readonly statusCode: number;

  public readonly data: T | null;
  public readonly message: string;

  public readonly success: boolean;

  constructor({
    statusCode,
    data = null,
    message = "Success",
    success,
  }: ApiResponseProps<T>) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success =
      success !== undefined ? success : statusCode >= 200 && statusCode < 300;
  }
}

export { ApiResponse };
