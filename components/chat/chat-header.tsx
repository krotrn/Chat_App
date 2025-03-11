import { Chat } from "@/types/ChatType";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import HeaderActions from "./header-action";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";

interface ChatHeaderProps {
  chat: Chat;
  onToggleDetails: () => void;
  onDeleteChat: () => void;
  isLoading?: boolean;
  onBack?: () => void;
}

export default function ChatHeader({
  chat,
  onToggleDetails,
  onDeleteChat,
  isLoading = false,
  onBack,
}: ChatHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex fixed h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="md:hidden" // Hide on desktop (md and up)
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-16 items-center justify-between border-b px-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden" // Hide on desktop (md and up)
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar>
          <AvatarImage src={chat.avatar} alt={chat.name} />
          <AvatarFallback>{chat.name[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{chat.name}</h2>
          {chat.isGroup && (
            <p className="text-sm text-muted-foreground">{`${chat.participants} members`}</p>
          )}
        </div>
      </div>
      <HeaderActions
        isAdmin={false}
        onToggleDetails={onToggleDetails}
        onDeleteChat={onDeleteChat}
      />
    </div>
  );
}
