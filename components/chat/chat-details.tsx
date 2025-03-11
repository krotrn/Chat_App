"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatDetailsProps {
  onClose: () => void;
  isLoading?: boolean;
}

export default function ChatDetails({
  onClose,
  isLoading = false,
}: ChatDetailsProps) {
  if (isLoading) {
    return (
      <motion.div
        className="w-80 border-l bg-background"
        initial={{ x: 80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 80, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4 space-y-6">
            {/* Participants section skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-24 mb-2" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>

            {/* Media section skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-24 mb-2" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </div>
            </div>

            {/* Files section skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-24 mb-2" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-md border p-2"
                >
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-80 border-l bg-background"
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h3 className="font-semibold">Chat Details</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close details"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
