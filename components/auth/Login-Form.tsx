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
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "./Form-Error";
import { FormSuccess } from "./Form-Success";
import { useState, useTransition } from "react";
import { signin } from "@/actions/signin";

const LoginForm = () => {
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });
  const [error, setError] = useState<string | undefined>("");
  const [success, setSucess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (credentials: z.infer<typeof signInSchema>) => {
    setError("");
    setSucess("");
    startTransition(() => {
      signin(credentials).then((data) => {
        if ("error" in data) {
          setError(data.error);
        }
        if ("success" in data) {
          setSucess(data.success);
        }
      });
    });
  };

  return (
    <CardWrapper
      backButtonHref="/auth/register"
      backButtonLabel="Don't have an account ?"
      headerLabel="Welcome Back"
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
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder="Username"
                    type="text"
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
                    placeholder="Password"
                    type="password"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;
