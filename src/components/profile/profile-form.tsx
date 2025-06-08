"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { profileSchema } from "@/schemas/profileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Input,
  Button,
} from "@/components/ui";
import { FormError, FormSuccess, ProfileUpdateSkeleton } from "@/components";

import {
  useProfileUpdateMutation,
  useGetUserByUsernameQuery,
  useAppSelector,
} from "@/hooks";

export function ProfileForm() {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const {
    mutate: updateProfileMutation,
    error,
    isPending,
    isSuccess,
  } = useProfileUpdateMutation();
  const username = useAppSelector((state) => state.user.user?.username);

  const {
    data: userData,
    isLoading,
    error: userError,
  } = useGetUserByUsernameQuery(username);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: "",
      status: "",
      username: "",
      name: "",
      bio: "",
      avatar: undefined,
      role: undefined,
    },
  });

  useEffect(() => {
    if (userData && username) {
      form.reset({
        email: userData.email || "",
        status: userData.status || "",
        username: userData.username || "",
        name: userData.name || "",
        bio: userData.bio || "",
        avatar: undefined,
        role: userData.role,
      });
    }
  }, [userData, form, username]);

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
    updateProfileMutation(data);
  };

  if (isLoading) {
    return <ProfileUpdateSkeleton />;
  }

  if (userError) {
    return <div>Error loading user data: {userError.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-center items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Avatar className="h-36 w-36">
          <AvatarImage
            src={avatarPreview || userData?.avatarUrl || ""}
            alt={form.watch("name") || userData?.username}
          />
          <AvatarFallback>
            {form.watch("name")?.[0]?.toUpperCase() ||
              userData?.username?.[0]?.toUpperCase() ||
              "U"}
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
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    placeholder="Username"
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} placeholder="Email" readOnly />
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
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    placeholder="Your current status"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error?.message} />
          <FormSuccess
            message={isSuccess ? "Profile updated successfully!" : ""}
          />
          <Button type="submit" className="w-full" disabled={isPending}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
