"use client";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeaderActions from "@/components/chat/ui/header-action";
import { ChatType } from "@/types/ChatType";
import { User } from "next-auth";
import { useAppSelector } from "@/hooks/useReduxType";
import { useMemo } from "react";

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
  currentUser,
}: ChatHeaderProps) {
  const isAdmin = chat.admin === currentUser?.id;
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);
  const isOnline = useMemo(
    () => onlineUsers.some((p) => p !== currentUser?.id),
    [onlineUsers, currentUser],
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
              <div className="ml-2 flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                {chat.participants.length}
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
