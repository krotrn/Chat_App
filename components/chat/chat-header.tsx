import { ChatType } from "@/types/ChatType";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeaderActions from "@/components/chat/header-action";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  chat: ChatType;
  onToggleDetails: () => void;
  onDeleteChat: (chatId: string, forEveryone: boolean) => void;
  isLoading?: boolean;
  onBack?: () => void;
}

export default function ChatHeader({
  chat,
  onToggleDetails,
  onDeleteChat,
  onBack,
}: ChatHeaderProps) {
  return (
    <div className="flex h-16 items-center justify-between border-b px-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden"
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
          {chat.type === "group" && (
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
