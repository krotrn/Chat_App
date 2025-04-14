"use client";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeaderActions from "@/components/chat/header-action";
import { ChatType } from "@/types/ChatType";
import { User } from "next-auth";

interface ChatHeaderProps {
  chat: ChatType;
  onToggleDetails: () => void;
  onDeleteChat: (chatId: string, forEveryone: boolean) => Promise<void>;
  onBack?: () => void;
  currentUser?: User;
}

export default function ChatHeader({
  chat,
  onToggleDetails,
  onDeleteChat,
  onBack,
  currentUser,
}: ChatHeaderProps) {
  const isAdmin = chat.admin === currentUser?.id;
  const isOnline = chat.participants.some((p) => p.userId !== currentUser?.id);

  const otherParticipant = chat.participants.find(
    (p) => p.userId !== currentUser?.id
  );

  const displayName =
    chat.type === "direct" && otherParticipant
      ? otherParticipant.name || "User"
      : chat.name;

  const displayAvatar =
    chat.type === "direct" && otherParticipant
      ? otherParticipant.avatarUrl
      : chat.avatarUrl;

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
          <AvatarImage src={displayAvatar} alt={displayName} />
          <AvatarFallback>
            {displayName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <div className="flex items-center">
            <h2 className="text-base font-semibold">{displayName}</h2>
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

      <HeaderActions
        isAdmin={isAdmin}
        onToggleDetails={onToggleDetails}
        onDeleteChat={onDeleteChat}
        chatId={chat._id}
      />
    </div>
  );
}
