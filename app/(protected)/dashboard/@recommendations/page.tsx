import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRecommendations } from "@/actions/userUtils";
import Recommendations from "@/components/dashboard/Recommendations";

export default async function RecommendationsPage() {
  const session = await auth();
  if (!session || !session.user.id) redirect("/login");
  const recommendationsResponse = await getRecommendations();
  return (
    <Recommendations
      recommendations={recommendationsResponse}
      userId={session.user.id}
    />
  );
}
