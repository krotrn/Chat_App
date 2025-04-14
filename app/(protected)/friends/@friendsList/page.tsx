import { getUserFriends } from "@/actions/userUtils";
import { auth } from "@/auth";
import FriendsList from "@/components/friends/friends-list";

export default async function FriendsListPage() {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("unauthoriozed");
  const friends = await getUserFriends(session.user.id);

  return <FriendsList friends={friends} userId={session.user.id} />;
}
