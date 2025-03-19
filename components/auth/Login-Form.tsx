"use client";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInSchema } from "@/schemas/signinSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/auth/Form-Error";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const LoginForm = (): React.ReactNode => {
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();


  const onSubmit = (credentials: z.infer<typeof signInSchema>) => {
    setError("");
    startTransition(() => {
      fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
        .then((data) => data.json())
        .then((result) => {
          if (result.sendEmail) {
            router.push(`/auth/verify-email/${result.encodedEmail}`);
          } else if (result.success) {
            router.push(DEFAULT_LOGIN_REDIRECT);
          } else {
            setError(result.message);
          }
        })
        .catch(() => {
          setError("An unexpected error occurred");
        });
    });
  };

  return (
    <CardWrapper
      backButtonHref="/register"
      backButtonLabel="Don't have an account?"
      headerLabel="Welcome Back"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="you@example.com or username"
                    type="text"
                    disabled={isPending}
                    autoComplete="username"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
            aria-disabled={isPending}
          >
            {(isPending) ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;
