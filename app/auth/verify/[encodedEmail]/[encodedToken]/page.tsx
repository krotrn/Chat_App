import { CardWrapper } from "@/components/auth/card-wrapper";
import VerificationPage from "@/components/auth/VerificationPage";

export default async function Page({
  params,
}: {
  params: Promise<{ encodedEmail: string; encodedToken: string }>;
}) {
  const { encodedEmail, encodedToken } = await params;
  return (
    <div className="flex items-center justify-center min-h-screen">
      <CardWrapper
        backButtonHref="/login"
        backButtonLabel="Back to Login"
        headerLabel="Verify"
      >
        <VerificationPage
          encodedEmail={encodedEmail}
          encodedToken={encodedToken}
        />
      </CardWrapper>
    </div>
  );
}
