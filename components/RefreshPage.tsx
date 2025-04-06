"use client";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useRouter } from "next/navigation";

export default function RefreshPage() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <EmptyState
          title="No user data available"
          description="We couldn't find any user data. Please try again later or contact support."
          type="empty"
          action={
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          }
        />
      </div>
      <div className="md:col-span-2">
        <EmptyState
          title="No activity data"
          description="Once you start using the platform, your activity will appear here."
          type="empty"
        />
      </div>
    </div>
  );
}
