import { Metadata } from "next";
import { DatabaseOfflinePage } from "@/components/offline/database-offline-page";
import { config } from "@/config";

export const metadata: Metadata = {
  title: `${config.appName || "App"} - Database Connection Lost`,
  description:
    "We're having trouble connecting to our database. Please try again in a few moments.",
};

export default function DatabaseOfflineRoute() {
  return <DatabaseOfflinePage />;
}
