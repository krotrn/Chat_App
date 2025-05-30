"use client";

import { useEffect } from "react";

export default function ChatMainError({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Chat main error:", error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center text-red-500">
      Failed to load chat. Please try again.
    </div>
  );
}
