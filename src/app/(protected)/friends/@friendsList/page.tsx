import { auth } from "@/auth";
import FriendsList from "@/components/friends/friends-list";

export default async function FriendsListPage() {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("unauthoriozed");
  return <FriendsList />;
}
