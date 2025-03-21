
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, User, UserPlus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, ActivityType } from "@prisma/client";

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type:ActivityType) => {
    switch (type) {
      case "MESSAGE":
        return <MessageSquare className="h-4 w-4" />;
      case "FRIENDREQUEST":
        return <UserPlus className="h-4 w-4" />;
      case "NEWFRIEND":
        return <User className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            title="No recent activity"
            description="Your recent activities will appear here once you start interacting with others."
            type="empty"
          />
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                {activity.userId ? (
                  <Avatar>
                    <AvatarImage
                      src={activity.userAvatarUrl}
                      alt={activity.userName || "User"}
                    />
                    <AvatarFallback>
                      {activity.userName ? activity.userName[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm">{activity.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.updatedAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
