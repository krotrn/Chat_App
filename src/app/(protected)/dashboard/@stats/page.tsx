import { getUserStats } from "@/actions/user";
import { UserStats } from "@/components/dashboard/user-stats";

export default async function StatsPage() {
  const userStatsResponse = await getUserStats();
  return (
    <UserStats
      friendCount={userStatsResponse.totalFriends}
      groupChatCount={userStatsResponse.totalGroups}
    />
  );
}
