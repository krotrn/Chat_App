"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { RecommendationWithRelations } from "@/actions/userUtils";
import RecommendationCard from "@/components/dashboard/recommendation-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface RecommendationsProps {
  recommendations: RecommendationWithRelations[];
  userId: string;
}

export default function Recommendations({
  recommendations,
  userId,
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
              {recommendations.map((recommendation) => (
                <CarouselItem
                  key={recommendation.id}
                  defaultValue={recommendation.id}
                  className="md:basis-1/2 lg:basis-1/2 flex items-center space-x-4 p-4"
                >
                  <RecommendationCard
                    recommendation={recommendation}
                    key={recommendation.id}
                    userId={userId}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </CardContent>
    </Card>
  );
}
