import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserStats } from "@/actions/userUtils";
import { UserStats } from "@/components/dashboard/user-stats";

export default async function StatsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const userStatsResponse = await getUserStats(["friends"]);
  const friendCount = userStatsResponse.friends.length ?? 0;
  const groupChatCount = 0; // TODO
  return (
    <UserStats friendCount={friendCount} groupChatCount={groupChatCount} />
  );
}