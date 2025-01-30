interface ApiResponseProps {
  statusCode: number;
  data: unknown;
  message?: string;
  success?: boolean;
}

class ApiResponse {
  statusCode: number;
  data: unknown;
  message: string;
  success: boolean;
  constructor({statusCode, data, message = "Success"}: ApiResponseProps) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };