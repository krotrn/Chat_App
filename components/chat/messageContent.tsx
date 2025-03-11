import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import AttachmentPreview from "@/components/chat/attachment-previews"
import { format } from "date-fns"
import type { Message, MessageReaction } from "@/types/ChatType"
import { mockUsers } from "@/lib/mock-data"

interface MessageContentServerProps {
  message: Message
  isOwn: boolean
  showAvatar: boolean
  replyMessage?: Message | null
  replyButton: React.ReactNode
  reactionsPopover: React.ReactNode
}

export function MessageContentServer({
  message,
  isOwn,
  showAvatar,
  replyMessage,
  replyButton,
  reactionsPopover,
}: MessageContentServerProps) {
  const sender = mockUsers.find((user) => user.id === message.senderId)
  const replySender = replyMessage ? mockUsers.find((user) => user.id === replyMessage.senderId) : null;

  const groupedReactions: Record<string, MessageReaction[]> = {}
  message.reactions?.forEach((reaction) => {
    if (!groupedReactions[reaction.emoji]) {
      groupedReactions[reaction.emoji] = []
    }
    groupedReactions[reaction.emoji].push(reaction)
  })

  return (
    <div>

    </div>
  )
}