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
import { FormSuccess } from "./Form-Success";

const RegisterForm = () => {
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
  const router = useRouter()

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string |undefined>("")
  const [isPending, startTransition] = useTransition();

  const onSubmit = (credentials: z.infer<typeof registerSchema>) => {
    setError("");
    startTransition(() => {
      fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
        .then((data) => data.json())
        .then((result) => {
          if (result.success) {
            setSuccess(result.message);
            router.push('/auth/verify-email');
          } else {
            setError(result.message)
          }
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
