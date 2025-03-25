"use client";

import { useEffect } from "react";

export default function ProfileError({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Profile error:", error);
  }, [error]);
  return (
    <div className="text-red-500">
      Failed to load profile. Please try again.
    </div>
  );
}