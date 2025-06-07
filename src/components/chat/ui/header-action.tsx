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
import { useDeleteDirectChatMutation } from "@/hooks/queries/useDirectChatMutation";
import { useAppSelector } from "@/hooks/useReduxType";

interface HeaderActionsProps {
  isAdmin: boolean;
  onToggleDetails: () => void;
}

export default function HeaderActions({
  isAdmin,
  onToggleDetails,
}: HeaderActionsProps) {
  const { mutate: onDeleteChat } = useDeleteDirectChatMutation();
  const chatId = useAppSelector((state) => state.currentChat.currentChat?._id);
  if (!chatId) {
    return null;
  }

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
              onClick={() => onDeleteChat({ chatId, forEveryone: true })}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete chat
            </DropdownMenuItem>
          )}
          {!isAdmin && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDeleteChat({ chatId, forEveryone: false })}
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
