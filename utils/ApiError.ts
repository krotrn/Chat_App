interface ApiErrorOptions {
  statusCode: number;
  message?: string;
  errors?: unknown[];
  stack?: string;
  data?: unknown;
}

class ApiError extends Error {
  statusCode;
  data: unknown;
  success: boolean;
  errors: unknown;
  constructor({
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = "",
    data = null
  }: ApiErrorOptions) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
