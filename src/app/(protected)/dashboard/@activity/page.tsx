import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getActivities } from "@/actions/userUtils";
import { RecentActivity } from "@/components/dashboard/RecentChats";

export default async function ActivityPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const activityResponse = await getActivities();
  return <RecentActivity activities={activityResponse} />;
}
