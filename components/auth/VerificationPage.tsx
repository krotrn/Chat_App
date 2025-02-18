"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  encodedEmail: string;
  encodedToken: string;
}

export default function VerificationPage({ encodedEmail, encodedToken }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    "Verification Link sent to your Email."
  );

  useEffect(() => {
    fetch(`/api/v1/auth/${encodedEmail}/${encodedToken}`, {
      method:"POST"
    })
      .then((data) => data.json())
      .then((result) => {
        if (result.success) {
          setSuccess(result.message);
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setError(result.message || "Something went wrong.");
        }
      });
  }, [router, encodedEmail, encodedToken]);

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-destructive text-center">{error}</p>}
      {success && <p className="text-green-600 text-center">{success}</p>}
    </div>
  );
}
