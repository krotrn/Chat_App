import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { RecentActivity } from "@/components/dashboard/RecentChats";
import { UserStats } from "@/components/dashboard/user-stats";
import Recommendations from "@/components/dashboard/Recommendations";
import { getUser } from "@/lib/user-service";
import ProfileGlance from "@/components/dashboard/ProfileGlance";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function UserDashboard() {
  const session = await auth();
  if (!session) redirect("/login");
  const user = await getUser();

  try {
    if (!session.user) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <EmptyState
              title="No user data available"
              description="We couldn't find any user data. Please try again later or contact support."
              type="empty"
              action={
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              }
            />
          </div>
          <div className="md:col-span-2">
            <EmptyState
              title="No activity data"
              description="Once you start using the platform, your activity will appear here."
              type="empty"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ProfileGlance user={session.user} />
          <UserStats friendCount={0} groupChatCount={0} className="mt-6" />
        </div>

        <div className="md:col-span-2 space-y-6">
          <RecentActivity activities={user.recentActivities || []} />
          <Recommendations recommendations={user.recommendations || []} />
        </div>
      </div>
    );
  } catch {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <EmptyState
            title="Error loading user data"
            description="We encountered an error while loading your data. Please try again later."
            type="error"
            action={
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            }
          />
        </div>
        <div className="md:col-span-2">
          <EmptyState
            title="Error loading activity data"
            description="We encountered an error while loading your activity data."
            type="error"
          />
        </div>
      </div>
    );
  }
}
