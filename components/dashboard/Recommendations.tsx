import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RecommendationWithRelations } from "@/actions/userUtils";
import RecommendationCard from "./recommendation-card";

interface RecommendationsProps {
  recommendations: RecommendationWithRelations[];
  userId: string;
}

export default function Recommendations({
  recommendations,
  userId
}: RecommendationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <EmptyState
            title="No recommendations available"
            description="We'll show personalized recommendations as you use the platform more."
            type="empty"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                recommendation={recommendation}
                key={recommendation.id}
                userId={userId}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
