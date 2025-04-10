export const config = {
  baseUrl: process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000",
  chatApiUrl: process.env.CHAT_API_URL || "https://chat-backend-kr.vercel.app",
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
  emailTokenExpirationTime: Number(process.env.EMAIL_TOKEN_EXPIRATION_TIME) || 1, 
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL
};
