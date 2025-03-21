export const handleSuccess = (data: unknown, message: string) => ({
  success: true,
  error: false,
  data,
  message,
});

export const handleError = (message: string) => ({
  success: false,
  error: true,
  message,
});