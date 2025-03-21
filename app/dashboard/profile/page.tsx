import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileWrapper from "@/components/profile/profile";
import { SessionProvider } from "next-auth/react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="space-y-6 w-full max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and profile information.
          </p>
        </div>
        <SessionProvider>
          <ProfileWrapper user={session.user} />
        </SessionProvider>
      </div>
    </div>
  );
}
