"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormError } from "./Form-Error";
import { FormSuccess } from "./Form-Success";

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
    fetch(`/api/v1/auth/${encodedEmail}/${encodedToken}`, {
      method: "POST",
    })
      .then((data) => data.json())
      .then((result) => {
        if (result.success) {
          setSuccess(result.message);
          setTimeout(() => router.push("/login"), 2000);
        } else if(result.reverify){
          setError(result.message || "Something went wrong.");
          setTimeout(() => router.push(`/auth/verify-email/${encodedEmail}`), 2000);
        }else {
          setError(result.message || "Something went wrong.");
        }
      });
  }, [router, encodedEmail, encodedToken]);

  return (
    <div className="flex flex-col gap-4">
      <FormError message={error} />
      <FormSuccess message={success} />
    </div>
  );
}
