import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import LoadingDashboard from "@/components/dashboard/loading-dashboard";
import {
  getActivities,
  getRecommendations,
  getUserStats,
} from "@/actions/userUtils";
import { Activity, Recommendations } from "@prisma/client";
import { statsProps } from "@/types/ChatType";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [recommendationsResponse, activityResponse, userStatsResponse] = await Promise.all([
    getRecommendations(),
    getActivities(),
    getUserStats(),
  ]);

  if (
    recommendationsResponse.error ||
    activityResponse.error ||
    userStatsResponse.error
  ) {
    
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">
          Error loading dashboard: Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="sr-only">Home Dashboard</h1>
      <Suspense fallback={<LoadingDashboard />}>
        <UserDashboard
          user={session.user}
          recommendations={recommendationsResponse.data as Recommendations[]}
          activity={activityResponse.data as Activity[]}
          stats={userStatsResponse.data as statsProps}
        />
      </Suspense>
    </div>
  );
}