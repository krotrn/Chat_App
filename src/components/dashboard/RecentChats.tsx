"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, User, UserPlus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, ActivityType } from "@prisma/client";
import { format } from "date-fns";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: ActivityType) => {
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
          <Carousel
            opts={{
              align: "start",
              loop: true,
              active: true,
            }}
            plugins={[
              Autoplay({
                delay: 2000,
              }),
            ]}
          >
            <CarouselContent>
              {activities.map((activity) => (
                <CarouselItem
                  key={activity.id}
                  defaultValue={activity.id}
                  className="md:basis-1/2 lg:basis-1/2 flex items-center space-x-4 p-4"
                >
                  {activity.userId ? (
                    <Avatar>
                      <AvatarImage
                        className="h-10 w-10"
                        src={activity.userAvatarUrl || ""}
                        alt={activity.userName || "User"}
                      />
                      <AvatarFallback>
                        {activity.userName?.[0].toUpperCase() ?? "U"}
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
                      {activity.updatedAt
                        ? format(new Date(activity.updatedAt), "PPP")
                        : "Unknown date"}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
}
