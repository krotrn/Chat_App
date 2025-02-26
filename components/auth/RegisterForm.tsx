"use client";
import { CardWrapper } from "@/components/auth/card-wrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { registerSchema } from "@/schemas/registerSchema";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/auth/Form-Error";
import { Button } from "@/components/ui/button";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormSuccess } from "@/components/auth/Form-Success";

/**
 * RegisterForm component handles the user registration process.
 * It uses `useForm` from `react-hook-form` and `zodResolver` for form validation.
 * The form includes fields for email, username, and password.
 * 
 * @returns {React.ReactNode} The rendered RegisterForm component.
 * 
 * @component
 * 
 * @example
 * return (
 *   <RegisterForm />
 * )
 * 
 * @remarks
 * - The form submission is handled by the `onSubmit` function which sends a POST request to the `/api/v1/auth/register` endpoint.
 * - If the registration is successful, the user is redirected to the `/auth/verify-email` page.
 * - If there is an error, it is displayed to the user.
 * - The component also handles OAuth errors by displaying a specific message if the email is already in use with a different provider.
 * 
 * @hook
 * - `useSearchParams` to get URL search parameters.
 * - `useForm` from `react-hook-form` to manage form state and validation.
 * - `useRouter` from `next/router` to handle navigation.
 * - `useState` to manage local state for error and success messages.
 * - `useTransition` to handle the pending state of the form submission.
 * 
 * @dependencies
 * - `react-hook-form`
 * - `zod`
 * - `next/router`
 * 
 * @param {Object} props - The props object.
 * @param {string} props.backButtonHref - The href for the back button.
 * @param {string} props.backButtonLabel - The label for the back button.
 * @param {string} props.headerLabel - The label for the header.
 * @param {boolean} props.showSocial - Whether to show social login options.
 */
const RegisterForm = ():React.ReactNode => {
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") == "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : "";
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });
  const router = useRouter();

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (credentials: z.infer<typeof registerSchema>) => {
    setError("");
    startTransition(() => {
      fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
        .then((data) =>  data.json())
        .then((result) => {
          if (result.sendEmail) {
            setError(result.message);
            router.push(`/auth/verify-email/${encodeURIComponent(credentials.email)}`);
          } else if (result.success) {
            setSuccess(result.message)
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
      backButtonHref="/login"
      backButtonLabel="Already have an Account?"
      headerLabel="Welcome"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="youremail@example.com"
                    type="email"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Username"
                    type="text"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Password"
                    type="password"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            Register
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;
