"use client";

import { useEffect } from "react";

export default function ChatListError({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Chat list error:", error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center text-red-500">
      Failed to load chat list. Please try again.
    </div>
  );
}
