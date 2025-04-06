"use client";

import { useEffect } from "react";

export default function ActivityError({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Activity error:", error);
  }, [error]);
  return (
    <div className="text-red-500">
      Failed to load activity. Please try again.
    </div>
  );
}
