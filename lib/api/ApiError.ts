export class ApiError extends Error {
  public statusCode: number;
  public errors: string[];

  constructor({ statusCode, message, errors = [] }: { statusCode: number; message: string; errors?: string[] }) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}