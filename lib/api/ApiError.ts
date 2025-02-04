interface ApiErrorOptions {
  statusCode: number;
  message?: string;
  errors?: (Error | string)[];
  stack?: string;
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
}

export { ApiError };
