"use client";

import InputOTPForm from "@/components/auth/VerificationForm";
import { verifyToken } from "@/utils/token.utils";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function Page({
  searchParams: { email, token, otp },
}: {
  searchParams: { email: string; token?: string; otp?: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    if (token) {
      startTransition(() => {
        verifyToken(email, token, true).then(data => {
          if ("error" in data) {
            setError(data.error || "An unexpected error occurred");
          } else {
            setSuccess(data.success || "Email verified successfully!");
            router.push("/");
          }
        });
      });
    }
  }, [token, email, router]);

  return (
    <div className="flex flex-col gap-4">
      <InputOTPForm email={email} pin={otp} pending={isPending} />
      {error && <p className="text-destructive text-center">{error}</p>}
      {success && <p className="text-green-600 text-center">{success}</p>}
    </div>
  );
}