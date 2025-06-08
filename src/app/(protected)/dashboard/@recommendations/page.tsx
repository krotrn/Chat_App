import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getRecommendations } from "@/actions/user";
import { Recommendations } from "@/components";

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
