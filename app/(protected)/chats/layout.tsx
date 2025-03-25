"use client";
import { useSearchParams } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function ChatsLayout({
  chatList,
  chatMain,
}: {
  chatList: React.ReactNode;
  chatMain: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const selectedChatId = searchParams.get("chat");
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div
        className={cn(
          "w-full md:w-80 border-r",
          isMobile && selectedChatId && "hidden"
        )}
      >
        {chatList}
      </div>
      <div
        className={cn(
          "flex-1",
          isMobile && !selectedChatId && "hidden"
        )}
      >
        {chatMain}
      </div>
    </div>
  );
}