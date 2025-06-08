import { getUserStats } from "@/actions/user";
import { UserStats } from "@/components";

export default async function StatsPage() {
  const userStatsResponse = await getUserStats();
  return (
    <UserStats
      friendCount={userStatsResponse.totalFriends}
      groupChatCount={userStatsResponse.totalGroups}
    />
  );
}
