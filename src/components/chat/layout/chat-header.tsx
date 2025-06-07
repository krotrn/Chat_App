"use client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeaderActions from "@/components/chat/ui/header-action";
import { ChatType } from "@/types/ChatType";
import { User } from "next-auth";
import { useAppSelector } from "@/hooks/useReduxType";
import { useMemo } from "react";
import { AnimatedTooltip } from "@/components/ui/animate-tootip";
import { useGetUserByUsernameQuery } from "@/hooks/queries/useGetUserByUsernameQuery";

interface ChatHeaderProps {
  chat: ChatType;
  userId: string;
  onToggleDetails: () => void;
  onBack?: () => void;
  currentUser?: User;
}

export default function ChatHeader({
  chat,
  userId,
  onToggleDetails,
  onBack,
}: ChatHeaderProps) {
  const username = useAppSelector((state) => state.user.user?.username);
  const user = useGetUserByUsernameQuery(username).data;
  const isAdmin = chat.admin === user?.id;
  const onlineUserIds = useAppSelector(
    (state) => state.onlineUsers.onlineUserIds
  );
  const isOnline = useMemo(
    () => onlineUserIds.some((p) => p !== user?.id),
    [onlineUserIds, user?.id]
  );

  let title: string;
  let avatar: string | undefined;
  if (chat.type === "direct") {
    [title, avatar] = [
      chat.participants.filter((p) => p.userId !== userId)[0].name,
      chat.participants.filter((p) => p.userId !== userId)[0].avatarUrl,
    ];
  } else {
    title = chat.name;
    avatar = chat.avatarUrl;
  }

  return (
    <div className="flex h-16 items-center border-b px-4">
      {onBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="mr-2 md:hidden"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}

      <div className="flex flex-1 items-center">
        <Avatar className="h-9 w-9 mr-3">
          <AvatarImage src={avatar} alt={title} />
          <AvatarFallback>{title.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <div className="flex items-center">
            <h2 className="text-base font-semibold">{title}</h2>
            {chat.type === "group" && (
              <div className="flex ml-4 flex-row items-center justify-center w-full">
                <AnimatedTooltip items={chat.participants} />
              </div>
            )}
          </div>

          {chat.type === "direct" && (
            <p className="text-xs text-muted-foreground">
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      <HeaderActions isAdmin={isAdmin} onToggleDetails={onToggleDetails} />
    </div>
  );
}
