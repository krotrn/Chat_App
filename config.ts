export const config = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
  emailTokenExpirationTime: Number(process.env.EMAIL_TOKEN_EXPIRATION_TIME) || 1, 
  appName: process.env.APP_NAME,
};
