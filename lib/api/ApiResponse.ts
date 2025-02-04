interface ApiResponseProps {
  statusCode: number;
  data?: unknown;
  message?: string;
  success?: boolean;
}

class ApiResponse {
  public readonly statusCode: number;
  public readonly data: unknown;
  public readonly message: string;
  public readonly success: boolean;

  constructor({ statusCode, data = null, message = "Success", success }: ApiResponseProps) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success ?? statusCode < 400;
  }
}

export { ApiResponse };
