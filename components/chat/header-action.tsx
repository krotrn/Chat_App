"use client";
import { Button } from "@/components/ui/button";
import { Info, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderActionsProps {
  isAdmin: boolean;
  onToggleDetails: () => void;
  onDeleteChat: (chatId: string, forEveryone: boolean) => void;
  chatId: string;
}

export default function HeaderActions({
  isAdmin,
  onToggleDetails,
  onDeleteChat,
  chatId,
}: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleDetails}
        aria-label="Chat details"
      >
        <Info className="h-5 w-5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="More options">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onToggleDetails}>
            View details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isAdmin && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDeleteChat(chatId, true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete chat
            </DropdownMenuItem>
          )}
          {!isAdmin && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDeleteChat(chatId, false)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Leave chat
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
