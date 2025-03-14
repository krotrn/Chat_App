"use client";
import { User } from "next-auth";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  useTransition,
} from "react";
import ProfileUpdateSkeleton from "../skeleton/profile-update-skeleton";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { updateUserProfile } from "@/lib/user-service";

export default function ProfileForm({ user }: { user: User }) {
  const [isLoading, startTransition] = useTransition();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: user.name || "User",
    bio: user.bio,
    avatar: user.avatarUrl || "",
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateUserProfile(user.id!, formData);
      } catch (error) {
        console.log(error);
        toast.error("Failed to Update Profile.");
      }
    });
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Update with Real Logic
    const url = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatar: url }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
        {!isInitialLoading ? (
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={formData.avatar}
                          alt={formData.name}
                        />
                        <AvatarFallback>
                          {formData.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-2">
                        <Label htmlFor="avatar" className="text-sm font-medium">
                          Profile Picture
                        </Label>
                        <Input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          Recommended size: 256x256px. Max size: 5MB.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="h-10 px-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 px-4"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        ) : (
          <ProfileUpdateSkeleton />
        )}
      </Tabs>
    </motion.div>
  );
}
