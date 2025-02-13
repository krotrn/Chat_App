"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ email: string; token?: string }>;
}) {
  const [data, setData] = useState<{ email: string; token?: string }>({
    email: "",
    token: "",
  });
  useEffect(() => {
    searchParams.then((d) => {
      setData(d);
    });
  }, [searchParams]);
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("Verification Link sent to your Email.");

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
