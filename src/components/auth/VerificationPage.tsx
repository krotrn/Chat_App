"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormError } from "@/components/auth/Form-Error";
import { FormSuccess } from "@/components/auth/Form-Success";
import { verifyEmailAction } from "@/actions/email";

interface Props {
  encodedEmail: string;
  encodedToken: string;
}

export default function VerificationPage({
  encodedEmail,
  encodedToken,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const response = await verifyEmailAction({
        email: decodeURIComponent(encodedEmail),
        encryptedToken: decodeURIComponent(encodedToken),
      });
      if (!response.success) {
        setError(response.message);
      } else {
        setSuccess(response.message);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };
    verifyEmail().catch((err) => {
      console.error("Verification failed:", err);
      setError(
        "An error occurred while verifying your email. Please try again.",
      );
    });
  }, [router, encodedEmail, encodedToken]);

  return (
    <div className="flex flex-col gap-4">
      <FormError message={error} />
      <FormSuccess message={success} />
    </div>
  );
}
