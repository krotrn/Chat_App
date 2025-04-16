import type { Metadata } from "next";
import OfflinePage from "@/components/offline/offline-page";
import { config } from "@/config";

export const metadata: Metadata = {
  title: `Offline | ${config.appName}`,
  description:
    "You are currently offline. Please check your internet connection.",
};

export default function OfflineRoute() {
  return <OfflinePage />;
}
