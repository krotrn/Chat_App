"use client";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@/components/ui";
import { MessageSquareMore, UserMinus } from "lucide-react";
import { FormattedFriendType } from "@/types/formattedDataTypes";
import { friendCardVariant } from "@/animations/friends/friend-card-variant";
import { ConnectionState, ParticipantsType } from "@/types";
import {
  useCreateDirectChatMutation,
  useAppSelector,
  useRemoveFriendMutation,
} from "@/hooks";
interface FriendCardProps {
  friend: FormattedFriendType;
}

export function FriendCard({ friend }: FriendCardProps) {
  const { mutate: createDirectChat, isPending } = useCreateDirectChatMutation();
  const { mutate: removeFriend } = useRemoveFriendMutation();
  const token = useAppSelector((state) => state.user.token);
  const user = useAppSelector((state) => state.user.user);
  const connectionState = useAppSelector(
    (state) => state.connection.connectionState,
  );
  const isConnected = connectionState === ConnectionState.CONNECTED;
  const handleMessageClick = async () => {
    if (!token || !user?.id) return;
    const participant: ParticipantsType = {
      avatarUrl: friend.avatarUrl,
      joinedAt: new Date(),
      name: friend.name || friend.username,
      role: "member",
      userId: friend.id,
    };
    const participant2: ParticipantsType = {
      avatarUrl: user.avatarUrl ?? undefined,
      name: user.name ?? friend.username,
      userId: user.id,
      role: "member",
      joinedAt: new Date(),
    };
    createDirectChat({
      participants: [participant, participant2],
      name: participant.name,
      token: token!,
    });
  };

  return (
    <motion.div
      variants={friendCardVariant}
      initial="hidden"
      animate="visible"
      exit="leave"
      className="flex items-center justify-between rounded-lg border p-3"
    >
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={friend.avatarUrl} alt={friend.name} />
          <AvatarFallback>
            {friend.name
              ? friend.name[0].toUpperCase()
              : friend.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{friend.name || friend.username}</p>
          {friend.email && (
            <p className="text-xs text-muted-foreground">{friend.email}</p>
          )}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending || !isConnected}
          onClick={handleMessageClick}
        >
          <MessageSquareMore className="h-4 w-4" />
          <span className="sr-only">Message</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={() =>
            removeFriend({ friendId: friend.id, userId: user?.id })
          }
        >
          <UserMinus className="h-4 w-4" />
          <span className="sr-only">Remove friend</span>
        </Button>
      </div>
    </motion.div>
  );
}
