"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, MessageSquare, User, UserPlus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, ActivityType } from "@prisma/client";
import { format } from "date-fns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.MESSAGE:
        return <MessageSquare className="h-4 w-4" />;
      case ActivityType.FRIENDREQUEST:
        return <UserPlus className="h-4 w-4" />;
      case ActivityType.NEWFRIEND:
        return <User className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
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
                stopOnFocusIn: true,
                stopOnInteraction: true,
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
                  {getActivityIcon(activity.type)}
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
