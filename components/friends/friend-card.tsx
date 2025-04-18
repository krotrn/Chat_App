"use client";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquareMore, UserMinus } from "lucide-react";
import { FormattedFriendType } from "@/types/formattedDataTypes";
import { friendCardVariant } from "@/animations/friends/friend-card-variant";
import { ParticipantsType } from "@/types/ChatType";
import { getUserDataById } from "@/actions/userUtils";
interface FriendCardProps {
  friend: FormattedFriendType;
  handleRemoveFriend: (friendId: string) => void;
  handleGetChat: (participants: ParticipantsType[], name: string) => void;
  userId: string;
  isPending: boolean;
}

export default function FriendCard({
  friend,
  handleRemoveFriend,
  handleGetChat,
  userId,
  isPending,
}: FriendCardProps) {
  const handleMessageClick = async () => {
    const participant: ParticipantsType = {
      avatarUrl: friend.avatarUrl,
      joinedAt: new Date(),
      name: friend.name || friend.username,
      role: "member",
      userId: friend.id,
    };

    const user = await getUserDataById(userId, {
      avatarUrl: true,
      name: true,
      role: true,
      id: true,
      username: true,
    });
    const participant2: ParticipantsType = {
      avatarUrl: user.avatarUrl ?? undefined,
      name: user.name ?? friend.username,
      userId: user.id,
      role: "member",
      joinedAt: new Date(),
    };
    handleGetChat(
      [participant, participant2],
      `${user.username} and ${friend.username}`,
    );
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
          <p className="font-medium">{friend.username}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={handleMessageClick}
        >
          <MessageSquareMore className="h-4 w-4" />
          <span className="sr-only">Message</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={() => handleRemoveFriend(friend.id)}
        >
          <UserMinus className="h-4 w-4" />
          <span className="sr-only">Remove friend</span>
        </Button>
      </div>
    </motion.div>
  );
}
