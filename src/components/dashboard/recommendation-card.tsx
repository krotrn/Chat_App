import {
  RecommendationWithRelations,
  sendFriendRequest,
} from "@/actions/userUtils";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { RecommendationType } from "@prisma/client";
import { UserPlus, Users } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

export default function RecommendationCard({
  recommendation,
  userId,
}: {
  recommendation: RecommendationWithRelations;
  userId: string;
}) {
  const avatar =
    recommendation.type === "FRIENDREQUEST"
      ? recommendation.recommendedUser?.avatarUrl
      : recommendation.type === "GROUP"
        ? recommendation.recommendedGroup?.avatarUrl
        : null;
  const title =
    recommendation.type === "FRIENDREQUEST"
      ? recommendation.recommendedUser?.name
      : recommendation.type === "GROUP"
        ? recommendation.recommendedGroup?.name
        : "Recommendation";
  const description =
    recommendation.type === "FRIENDREQUEST"
      ? recommendation.recommendedUser?.bio
      : recommendation.type === "GROUP"
        ? recommendation.recommendedGroup?.description
        : "";
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
  const handleAction = async (recommendation: RecommendationWithRelations) => {
    if (recommendation.type === "FRIENDREQUEST") {
      if (!recommendation.recommendedUser?.id) {
        toast.error("User ID is missing");
        return;
      }
      try {
        await sendFriendRequest(userId, recommendation.recommendedUser.id);
        //TODO Delete Recommendations
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          toast.error(error.message);
          return;
        }
        toast.error("somthing went wrong");
      }
    } else if (recommendation.type === "GROUP") {
      if (
        !recommendation.recommendedGroup?.id ||
        !recommendation.recommendedGroup.backendId
      ) {
        toast.error("Group information is missing");
        return;
      }
      try {
        //TODO Join Group
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          toast.error(error.message);
          return;
        }
        toast.error("somthing went wrong");
      }
    }
  };
  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-muted">
        <Image
          src={avatar || "/placeholder.svg"}
          alt={title || "User"}
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
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => handleAction(recommendation)}
        >
          {recommendation.type === "FRIENDREQUEST"
            ? "Add Friend"
            : "Join Group"}
        </Button>
      </CardContent>
    </Card>
  );
}
