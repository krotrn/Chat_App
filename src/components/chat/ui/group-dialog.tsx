"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { groupDetailsSchema } from "@/schemas/group-details";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MemberList from "./member-list";
import { useCreateGroupChatMutation } from "@/hooks/queries/useGroupChatMutations";
import { useAppSelector } from "@/hooks/useReduxType";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const token = useAppSelector((state) => state.user.token);
  const { mutateAsync, isPending, error, isSuccess } =
    useCreateGroupChatMutation();

  const form = useForm<z.infer<typeof groupDetailsSchema>>({
    resolver: zodResolver(groupDetailsSchema),
    defaultValues: {
      groupname: "",
      description: "",
      members: [],
      avatarUrl: "",
    },
  });

  // Handle error display
  useEffect(() => {
    if (error) {
      console.error("Group creation error:", error);
      toast.error(error.message || "Failed to create group");
    }
  }, [error]);

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Group created successfully!");
      form.reset();
      setOpen(false);
    }
  }, [isSuccess, form]);
  const onSubmit = async (data: z.infer<typeof groupDetailsSchema>) => {
    console.log("onSubmit function called!");
    console.log("Form data received:", data);
    console.log("Form validation state:", form.formState);
    console.log("Form errors:", form.formState.errors);

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    console.log("Token exists:", !!token);
    console.log("Members selected:", data.members);

    if (data.members.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    console.log("About to call mutateAsync...");
    try {
      await mutateAsync({
        name: data.groupname,
        participants: data.members.map((member) => ({
          userId: member.userId,
          name: member.name,
          avatarUrl: member.avatarUrl || "",
          role: "member" as const,
          joinedAt: new Date(),
        })),
        token,
      });
      console.log("Group creation successful!");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Group</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="groupname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter Group Name"
                      type="text"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Description"
                      type="text"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="members"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Members</FormLabel>
                  <FormControl>
                    <MemberList field={field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>{" "}
              <Button
                type="submit"
                onClick={() => {
                  console.log("Create Group button clicked!");
                  console.log("Form state:", {
                    isValid: form.formState.isValid,
                    errors: form.formState.errors,
                    values: form.getValues(),
                    isPending,
                    membersLength: form.watch("members").length,
                    groupname: form.watch("groupname"),
                    groupnameTrimmed: form.watch("groupname").trim(),
                  });
                }}
                disabled={isPending}
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Group
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
