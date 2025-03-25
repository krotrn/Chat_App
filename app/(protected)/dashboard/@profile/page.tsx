import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileGlance from "@/components/dashboard/ProfileGlance";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <ProfileGlance user={session.user} />;
}