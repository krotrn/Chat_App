"use client";
// import { useForm } from "react-hook-form";
import { CardWrapper } from "@/components";
// import { FormError } from "@/components";
// import {
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
//   Input,
//   Form,
//   FormControl,
//   Button,
// } from "@/components/ui";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { signInSchema } from "@/schemas/signinSchema";
// import { useState, useTransition } from "react";
// import { useRouter } from "next/navigation";
// import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
// import { signInCredential } from "@/actions/auth";

const LoginForm = (): React.ReactNode => {
  // const form = useForm<z.infer<typeof signInSchema>>({
  //   resolver: zodResolver(signInSchema),
  //   defaultValues: {
  //     identifier: "",
  //     password: "",
  //   },
  // });
  // const [error, setError] = useState<string | undefined>("");
  // const [isPending, startTransition] = useTransition();
  // const router = useRouter();

  // const onSubmit = (credentials: z.infer<typeof signInSchema>) => {
  //   setError("");
  //   startTransition(async () => {
  //     const response = await signInCredential(credentials);
  //     if (!response.success) {
  //       setError(response.message);
  //       return;
  //     } else {
  //       router.push(DEFAULT_LOGIN_REDIRECT);
  //     }
  //   });
  // };

  return (
    <CardWrapper
      backButtonHref="/register"
      backButtonLabel="Don't have an account?"
      headerLabel="Welcome Back"
      showSocial
    >
      {/* <Form {...form}>
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
      </Form>*/}
    </CardWrapper>
  );
};

export { LoginForm };
