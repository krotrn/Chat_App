/**
 * Options for configuring an API error.
 */
interface ApiErrorOptions {
  /**
   * The HTTP status code associated with the error.
   */
  statusCode: number;

  /**
   * An optional message describing the error.
   */
  message?: string;

  /**
   * An optional array of errors or error messages.
   */
  errors?: (Error | string)[];

  /**
   * An optional stack trace for the error.
   */
  stack?: string;

  /**
   * Optional additional data related to the error.
   */
  data?: unknown;
}

class ApiError extends Error {
  public readonly statusCode: number;
  public readonly data?: unknown;
  public readonly success: boolean;
  public readonly errors: (Error | string)[];

  constructor({
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack,
    data
  }: ApiErrorOptions) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.success = false;
    this.errors = Array.isArray(errors) ? errors : [errors];

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors.map(error => 
        error instanceof Error ? error.message : error
      ),
      success: this.success,
      data: this.data,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    };
  }
}

export { ApiError };