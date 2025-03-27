import { getPendingRequests } from "@/actions/userUtils";
import { auth } from "@/auth";
import FriendSearch from "@/components/friends/friend-search";

export default async function FriendSearchPage() {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("unauthoriozed");
  const pending = await getPendingRequests(session.user.id);
  return (
    <FriendSearch
      userId={session.user.id!}
      pending={pending.map((p) => p.id)}
    />
  );
}
