import { getUserDataById } from "@/actions/userUtils";
import { auth } from "@/auth";
import ProfileGlance from "@/components/dashboard/ProfileGlance";

export default async function ProfilePage() {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("Unauthorized");
  const user = await getUserDataById(session.user.id, {
    email: true,
    name: true,
    username: true,
    avatarUrl: true,
    bio: true,
  });
  return <ProfileGlance user={user} />;
}
