// app/auth/[encodedEmail]/[encodedToken]/page.tsx
import VerificationPage from "@/components/auth/VerificationPage";

export default async function Page({
  params,
}: {
  params: Promise<{ encodedEmail: string; encodedToken: string }>;
  }) {
  const {encodedEmail, encodedToken} = await params
  return (
    <VerificationPage
      encodedEmail={encodedEmail}
      encodedToken={encodedToken}
    />
  );
}
