"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { useState } from "react";

const Social = () => {
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "github" | null
  >(null);
  const onClick = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    await signIn(provider, {
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    setLoadingProvider(null);
  };
  return (
    <div className="flex flex-col items-center w-full space-y-2">
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        disabled={!!loadingProvider}
        onClick={() => onClick("google")}
      >
        {loadingProvider === "google" ? (
          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FcGoogle className="h-5 w-5" />
        )}
      </Button>
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        disabled={!!loadingProvider}
        onClick={() => onClick("github")}
      >
        {loadingProvider === "github" ? (
          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FaGithub className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default Social;
