"use client";

import { useEffect } from "react";

export default function RecommendationsError({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Recommendations error:", error);
  }, [error]);
  return (
    <div className="text-red-500">
      Failed to load recommendations. Please try again.
    </div>
  );
}
