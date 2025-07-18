import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getActivities } from "@/actions/user";
import { RecentActivity } from "@/components";

export default async function ActivityPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const activityResponse = await getActivities();
  return <RecentActivity activities={activityResponse} />;
}
