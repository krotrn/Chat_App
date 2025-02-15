"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
/**
 * Page component that handles email verification.
 *
 * This component retrieves email and token parameters from the URL,
 * sends a verification request to the server, and displays success or error messages.
 *
 * @returns {React.ReactNode} The rendered component.
 *
 * @component
 * @example
 * return <Page />;
 *
 * @remarks
 * - Uses `useSearchParams` to get URL parameters.
 * - Uses `useRouter` to navigate to the login page upon successful verification.
 * - Displays a success message if the verification link is sent.
 * - Displays an error message if the verification fails.
 */
export default function Page(): React.ReactNode {
  const [data, setData] = useState<{
    email: string | null;
    token: string | null;
  }>({
    email: "",
    token: "",
  });
  const searchParams = useSearchParams();
  setData({
    ...data,
    email: searchParams.get("email"),
    token: searchParams.get("token"),
  });
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>(
    "Verification Link sent to your Email."
  );

  useEffect(() => {
    if (data.token) {
      fetch(`/api/v1/auth/${data.email}/${data.token}`)
        .then((data) => data.json())
        .then((result) => {
          if (result.success) {
            setSuccess(result.message);
            router.push("/login");
          } else {
            setError(result.message || "something wrong happen.");
          }
        });
    }
  }, [data, router]);

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-destructive text-center">{error}</p>}
      {success && <p className="text-green-600 text-center">{success}</p>}
    </div>
  );
}
