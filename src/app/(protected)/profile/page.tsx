import { ProfileWrapper } from "@/components";

export default async function ProfilePage() {
  return (
    <div className="w-full flex items-center justify-center py-10 px-4">
      <div className="space-y-6 w-full max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and profile information.
          </p>
        </div>
        <ProfileWrapper />
      </div>
    </div>
  );
}
