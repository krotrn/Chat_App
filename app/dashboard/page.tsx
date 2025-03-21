import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import LoadingDashboard from "@/components/dashboard/loading-dashboard";
import { getActivities, getRecommendations, getUserStats } from "@/actions/userUtils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const RecommendationsResponse = await getRecommendations();
  const ActivityRespnse = await getActivities();
  const userQueryRespnse = await getUserStats();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="sr-only">Home Dashboard</h1>

      <Suspense fallback={<LoadingDashboard />}>
        <UserDashboard user={session.user} recommendations={RecommendationsResponse.data} activity={ActivityRespnse.data}
          stats={userQueryRespnse.data}
        />
      </Suspense>
    </div>
  );
}
