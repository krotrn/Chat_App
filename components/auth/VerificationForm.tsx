"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { OTPSchema } from "@/schemas/OTPSchema";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { FormError } from "./Form-Error";
import { FormSuccess } from "./Form-Success";
import { verify } from "@/actions/verify-otp";
import { sendEmail } from "@/actions/sendEmail";
import { getUserByEmail } from "@/utils/user.utils";
import useCountdown from "@/hooks/useCountdown";

export default function InputOTPForm({
  email,
  pin,
  pending,
}: {
  email?: string;
  pin?: string;
  pending?: boolean;
}) {
  const form = useForm<z.infer<typeof OTPSchema>>({
    resolver: zodResolver(OTPSchema),
    defaultValues: {
      email: email || "",
      pin: pin || "",
    },
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [resendSuccess, setResendSuccess] = useState<string>("");
  const [resendError, setResendError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const { secondsLeft, startCountdown } = useCountdown(30);

  useEffect(() => {
    if (email) {
      form.reset({ email, pin: pin || "" });
    }
  }, [email, pin, form]);

  const onSubmit = (values: z.infer<typeof OTPSchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        verify(values.email, values.pin).then((data) => {
          if ("error" in data) {
            setError(data.error!);
          } else {
            setSuccess(data.success);
            form.reset({ email: values.email, pin: "" });
          }
        });
      } catch {
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  const handleResend = async () => {
    setResendError("");
    setResendSuccess("");
    if (!email) {
      setResendError("Enter the Email.");
      return;
    }
    try {
      const user = await getUserByEmail(email!);
      if (user) {
        const result = await sendEmail(email);

        if (result?.error) {
          setResendError(result.error);
        } else {
          setResendSuccess("New OTP sent successfully");
          startCountdown(30);
        }
      } else {
        setResendError("Invalid Email.");
      }
    } catch {
      setResendError("Failed to resend OTP");
    }
  };

  return (
    <div className="w-96 shadow-md rounded-xl border bg-card text-card-foreground">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => <input type="hidden" {...field} />}
          />

          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    pattern={REGEXP_ONLY_DIGITS}
                    disabled={isPending || pending}
                    data-testid="otp-input"
                  >
                    <InputOTPGroup>
                      {[...Array(6)].map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>
                  Please enter the 6-digit code sent to {email}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormError message={error} />
          <FormSuccess message={success} />
          <FormError message={resendError} />
          <FormSuccess message={resendSuccess} />

          <Button
            type="submit"
            disabled={isPending || pending}
            className="w-full"
            data-testid="verify-button"
          >
            {isPending || pending ? "Verifying..." : "Verify OTP"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={isPending || pending || secondsLeft > 0}
            className="w-full"
            data-testid="otp-resend-button"
          >
            {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend OTP"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
