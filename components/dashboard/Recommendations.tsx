import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import Image from "next/image";
import { Recommendations as RecType, RecommendationType } from "@prisma/client";

interface RecommendationsProps {
  recommendations: RecType[];
}

export default function Recommendations({
  recommendations,
}: RecommendationsProps) {
  const getRecommendationIcon = (type: RecommendationType) => {
    switch (type) {
      case "FRIENDREQUEST":
        return <UserPlus className="h-4 w-4" />;
      case "GROUP":
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // TODO
  const handleAction = (type: RecommendationType, id: string) => {
    console.log(`Action: ${type} for ID ${id}`);
  };

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
              <Card key={recommendation.id} className="overflow-hidden">
                <div className="h-32 bg-muted">
                  <Image
                    src={recommendation.avatarUrl || "/placeholder.svg"}
                    alt={recommendation.title}
                    className="w-full h-full object-cover"
                    width={128}
                    height={128}
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      {getRecommendationIcon(recommendation.type)}
                    </div>
                    <h3 className="font-medium">{recommendation.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {recommendation.description}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      handleAction(recommendation.type, recommendation.id)
                    }
                  >
                    {recommendation.type === "FRIENDREQUEST"
                      ? "Add Friend"
                      : "Join Group"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}