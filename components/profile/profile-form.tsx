"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { profileSchema } from "@/schemas/profileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";
import { FormError } from "@/components/auth/Form-Error";
import { FormSuccess } from "@/components/auth/Form-Success";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile } from "@/actions/userUtils";

export default function ProfileForm({ user }: { user: User }) {
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
      avatar: undefined,
    },
  });

  const avatarFile = form.watch("avatar");

  useEffect(() => {
    if (avatarFile instanceof File) {
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAvatarPreview(null);
    }
  }, [avatarFile]);

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        const response = await updateProfile(data);
        if (response.success) {
          setSuccess(response.message);
          await update();
        } else if (response.error) {
          setError(response.message);
        } else {
          setError("Something went wrong.");
        }
      } catch (error) {
        console.log("Error updating profile:", (error as Error).message);
        setError("Failed to update profile");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-center items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Avatar className="h-36 w-36">
          <AvatarImage
            src={avatarPreview || user.avatarUrl || ""}
            alt={form.watch("name") || user.username}
          />
          <AvatarFallback>
            {form.watch("name")?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose Avatar</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/gif"
                    onChange={(e) =>
                      field.onChange(e.target.files ? e.target.files[0] : null)
                    }
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    placeholder="Name"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    placeholder="Tell about yourself."
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
