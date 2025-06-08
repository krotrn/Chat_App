"use client";
import React, { useCallback, useState, useTransition } from "react";
import { useCountdown } from "@/hooks";
import { sendVerificationEmail } from "@/actions/auth";
import { CardWrapper, FormError, FormSuccess } from "@/components";
import { Button } from "@/components/ui";

export function EmailVerification({
  email,
}: {
  email: string;
}): React.ReactNode {
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const { secondsLeft, startCountdown } = useCountdown(0);
  const [isPending, startTransition] = useTransition();
  const sendEmail = useCallback(async () => {
    setError("");
    startCountdown(30);
    startTransition(async () => {
      await sendVerificationEmail(email)
        .then((result) => {
          if (!result.success) {
            setError(result.message);
          } else {
            setSuccess(result.message);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }, [email, startCountdown]);

  return (
    <CardWrapper
      backButtonHref="/login"
      backButtonLabel="Back to Login."
      headerLabel="Verify Your Email"
    >
      <FormError message={error} />
      <FormSuccess message={success} />
      <Button
        className="w-full"
        onClick={sendEmail}
        disabled={isPending || secondsLeft > 0}
      >
        Verify
      </Button>
    </CardWrapper>
  );
}
