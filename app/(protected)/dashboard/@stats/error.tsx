"use client";

import { useEffect } from "react";

export default function StatsError({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Stats error:", error);
  }, [error]);
  return (
    <div className="text-red-500">Failed to load stats. Please try again.</div>
  );
}
