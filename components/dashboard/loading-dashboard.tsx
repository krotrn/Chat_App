import { ProfileSkeleton } from "@/components/skeleton/profile-skeletons";
import { StatsSkeleton } from "@/components/skeleton/stats-skeletons";
import { ActivitySkeleton } from "@/components/skeleton/activity-skeletons";
import { RecommendationsSkeleton } from "@/components/skeleton/recommendations-skeletons";

export default function LoadingDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <ProfileSkeleton />
        <StatsSkeleton className="mt-6" />
      </div>

      <div className="md:col-span-2 space-y-6">
        <ActivitySkeleton />
        <RecommendationsSkeleton />
      </div>
    </div>
  );
}
