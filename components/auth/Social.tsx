"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const Social = () => {
  const onClick = (provider: "google" | "github") => {
    signIn(provider, {
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  };
  return (
    <div className="flex flex-col items-center w-full space-y-2">
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => onClick("google")}
      >
        <FcGoogle className="h-5" />
      </Button>
      <Button
        size="lg"
        className="w-full"
        variant="outline"
        onClick={() => onClick("github")}
      >
        <FaGithub className="h-5" />
      </Button>
    </div>
  );
};

export default Social;
