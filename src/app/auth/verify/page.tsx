import { CardWrapper } from "@/components/auth/card-wrapper";
import VerificationPage from "@/components/auth/VerificationPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const encodedEmail = params.email as string | undefined;
  const encodedToken = params.token as string | undefined;

  if (!encodedEmail || !encodedToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CardWrapper
          backButtonHref="/login"
          backButtonLabel="Back to Login"
          headerLabel="Error"
        >
          <p className="text-red-500">Invalid verification link.</p>
        </CardWrapper>
      </div>
    );
  }
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
