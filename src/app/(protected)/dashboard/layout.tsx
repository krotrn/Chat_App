import { DatabaseCheckWrapper } from "@/components";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Chat Dashboard",
  description: "A modern chat dashboard with real-time messaging",
};

interface DashboardLayoutProps {
  profile: ReactNode;
  stats: ReactNode;
  activity: ReactNode;
  recommendations: ReactNode;
}

export default function DashboardLayout({
  profile,
  stats,
  activity,
  recommendations,
}: Readonly<DashboardLayoutProps>) {
  return (
    <DatabaseCheckWrapper>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4 px-4">
          {profile}
          {stats}
        </div>
        <div className="md:col-span-2 px-4 space-y-6">
          {activity}
          {recommendations}
        </div>
      </div>
    </DatabaseCheckWrapper>
  );
}
