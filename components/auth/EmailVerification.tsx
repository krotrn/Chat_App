"use client";
import React, { useCallback, useState } from "react";
import { CardWrapper } from "./card-wrapper";
import { Button } from "../ui/button";
import { FormError } from "./Form-Error";

/**
 * EmailVerification component is responsible for handling the email verification process.
 * It sends a verification email to the provided email address and displays any errors that occur during the process.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.email - The email address to which the verification email will be sent.
 *
 * @returns {React.ReactNode} The rendered EmailVerification component.
 */
export default function EmailVerification({
  email,
}: {
  email: string;
}): React.ReactNode {
  const [error, setError] = useState<string | undefined>(undefined);
  const sendEmail = useCallback(async () => {
    setError("");
    await fetch("/api/v1/auth/verify-email/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((data) => data.json())
      .then((result) => {
        if (!result.success) {
          setError(result.message);
        }
      });
  }, [email]);

  return (
    <CardWrapper
      backButtonHref="/login"
      backButtonLabel="Back to Login."
      headerLabel="Verify Your Email"
    >
      <FormError message={error} />
      <Button className="w-full" onClick={sendEmail}>
        Verify
      </Button>
    </CardWrapper>
  );
}
