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
  /**
   * The HTTP status code of the response.
   */
  public readonly statusCode: number;

  /**
   * The data returned in the response. Can be null if no data is returned.
   */
  public readonly data: T | null;

  /**
   * A message describing the response. Defaults to "Success".
   */
  public readonly message: string;

  /**
   * Indicates whether the request was successful. Defaults to true if the status code is between 200 and 299.
   */
  public readonly success: boolean;

  constructor({
    statusCode,
    data = null,
    message = "Success",
    success
  }: ApiResponseProps<T>) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success !== undefined ? success : statusCode >= 200 && statusCode < 300;
  }

  /**
   * Converts the ApiResponse instance to a JSON object.
   *
   * @returns {Object} The JSON representation of the ApiResponse instance.
   */
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