import { RecentActivity } from "@/components/dashboard/RecentChats";
import { UserStats } from "@/components/dashboard/user-stats";
import Recommendations from "@/components/dashboard/Recommendations";
import ProfileGlance from "@/components/dashboard/ProfileGlance";

import Authorized from "../authorized";
import { User } from "next-auth";
import {
  Activity,
  Recommendations as RecType,
} from "@prisma/client";
import { StatsProps } from "@/types/formattedDataTypes";
interface UserDashboardProps {
  user: User;
  recommendations: RecType[];
  activity: Activity[];
  stats: StatsProps;
}

export function UserDashboard({
  user,
  recommendations,
  activity,
  stats,
}: UserDashboardProps) {
  const friendCount = stats.friends.length ?? 0;
  // TODO: Group Count
  return (
    <Authorized user={user}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ProfileGlance user={user} />
          <UserStats
            friendCount={friendCount}
            groupChatCount={0}
            className="mt-6"
          />
        </div>

        <div className="md:col-span-2 space-y-6">
          <RecentActivity activities={activity} />
          <Recommendations recommendations={recommendations} />
        </div>
      </div>
    </Authorized>
  );
}
