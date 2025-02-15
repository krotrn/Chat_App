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


/**
 * LoginForm component handles the user login process.
 * 
 * This component uses `useForm` from `react-hook-form` and `zodResolver` for form validation.
 * It includes fields for the user identifier (email or username) and password.
 * 
 * On form submission, it sends a POST request to the `/api/v1/auth/login` endpoint with the user credentials.
 * If the login is successful, it redirects the user to the appropriate page.
 * If the login fails, it displays an error message.
 * 
 * @component
 * @example
 * return (
 *   <LoginForm />
 * )
 * 
 * @returns {React.ReactNode} The rendered login form component.
 */
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
          if (!result.success) {
            if (result.sendEmail) {
              router.push('/auth/verify-email')
            }
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
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;
