"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import useSearchQuery from "@/hooks/useSearchQuery";
import { AnimatePresence } from "framer-motion";
import FriendCard from "@/components/friends/friend-card";
import { FormattedFriendType } from "@/types/formattedDataTypes";
import { useState, useTransition, useEffect } from "react";
import { removeFriend } from "@/actions/userUtils";
import { toast } from "sonner";
import { createOrGetAOneOnOneChat, setAuthToken } from "@/services/chat-api";
import { ParticipantsType } from "@/types/ChatType";
import { useRouter } from "next/navigation";
interface FriendsListProps {
  friends: FormattedFriendType[];
  userId: string;
  accessToken: string;
}

export default function FriendsList({
  friends,
  userId,
  accessToken,
}: FriendsListProps) {
  const [searchQuery, setSearchQuery] = useSearchQuery("fr", "");
  const [isPending, startTransition] = useTransition();
  const [filteredFriends, setFilteredFriends] = useState(friends);

  const router = useRouter();

  useEffect(() => {
    setFilteredFriends(
      friends.filter((friend) =>
        (friend.name ? friend.name + friend.username : friend.username)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    );
  }, [friends, searchQuery]);

  const handleRemoveFriend = (friendId: string) => {
    try {
      startTransition(async () => {
        const response = await removeFriend(userId, friendId);
        if (!response.success) {
          toast.error(response.message);
          return;
        }

        toast.success(response.message);
        setFilteredFriends((prev) =>
          prev.filter((friend) => friend.id !== friendId),
        );
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(error.message);
      } else {
        toast.error("Error removing friend");
      }
    }
  };
  const handleGetChat = (participants: ParticipantsType[], name: string) => {
    try {
      startTransition(async () => {
        console.log("Creating chat with friend ID:", participants[0].userId);
        setAuthToken(accessToken);
        const response = await createOrGetAOneOnOneChat({ participants, name });
        console.log("Chat created/retrieved:", response);
        router.push(`/chats?chat=${response._id}`);
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        toast.error(error.message);
      } else {
        toast.error("Error creating chat");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Friends ({friends ? friends.length : 0})</CardTitle>
        <CardDescription>View and manage your connections</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search friends..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {(filteredFriends && filteredFriends.length) === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {searchQuery.length
                ? "No friends match your search"
                : "You don't have any friends yet"}
            </p>
          </div>
        ) : (
          <div>
            <AnimatePresence>
              {filteredFriends?.map((friend) => (
                <FriendCard
                  handleRemoveFriend={handleRemoveFriend}
                  handleGetChat={handleGetChat}
                  isPending={isPending}
                  userId={userId}
                  friend={friend}
                  key={friend.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
