"use client";
import {
  useSearchQuery,
  useFriendSearchQuery,
  useSendRequestMutation,
} from "@/hooks";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@/components/ui";
import { Loader2, Search, UserPlus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { SearchUserType } from "@/types/formattedDataTypes";
import { handleFriendRequest } from "@/actions/user";
import { toast } from "sonner";
import { FriendshipStatus } from "@prisma/client";

export function FriendSearch() {
  const [searchQuery, setSearchQuery] = useSearchQuery("nfr", "");
  const [searchResults, setSearchResult] = useState<SearchUserType[]>([]);
  const { mutate, isPending, isSuccess } = useFriendSearchQuery();
  const { mutate: sendFriendRequest, isPending: isSendingRequest } =
    useSendRequestMutation();
  const [sentRequest, setSentRequest] = useState<string[]>([]);
  useEffect(() => {
    if (!searchQuery) {
      setSearchResult([]);
    }
  }, [setSearchQuery, searchQuery]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    mutate(
      { contains: searchQuery },
      {
        onSuccess: (data) => {
          setSearchResult(data);
        },
        onError: (error) => {
          console.log(error);
          toast.error("Failed to search user");
        },
      },
    );
  };
  const handleSendRequest = async (id: string) => {
    try {
      sendFriendRequest(id);
      setSentRequest((prev) => [...prev, id]);
      toast.success("Friend request sent");
    } catch (error) {
      toast.error((error as Error).message || "Failed to send friend request");
    }
  };

  const handleRecieveRequest = async (id: string) => {
    try {
      await handleFriendRequest(id, FriendshipStatus.FRIENDS);
    } catch (error) {
      toast.error(
        (error as Error).message || "Failed to handle friend request",
      );
    }
  };

  const handleClickButton = (user: SearchUserType) => {
    if (user.isFriend) return;
    else if (user.hasSentRequest) return;
    else if (user.hasIncomingRequest) {
      handleRecieveRequest(user.id);
      return;
    }
    handleSendRequest(user.id);
  };
  const buttonContent = (user: SearchUserType) => {
    if (user.isFriend) {
      return "Already Friend";
    } else if (user.hasSentRequest || sentRequest.includes(user.id)) {
      return "Request Sent";
    } else if (user.hasIncomingRequest) {
      return "Accept Request";
    }
    return (
      <>
        <UserPlus className="mr-2 h-4 w-4" />
        Add Friend
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find Friends</CardTitle>
        <CardDescription>
          Search for users and send friend requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="pl-8 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={isPending} className="h-10">
            {isPending ? <Loader2 /> : "Search"}
          </Button>
        </div>
        <div className="space-y-4">
          <AnimatePresence>
            {searchResults.length > 0
              ? searchResults.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={user.avatarUrl || undefined}
                          alt={user.name || user.username}
                        />
                        <AvatarFallback>
                          {user.name
                            ? user.name[0].toUpperCase()
                            : user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.name || user.username}
                        </p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                        {user.mutualFriendsCount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {user.mutualFriendsCount} mutual friend
                            {user.mutualFriendsCount > 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        user.isFriend ||
                        user.hasIncomingRequest ||
                        user.hasSentRequest ||
                        sentRequest.includes(user.id) ||
                        isSendingRequest
                      }
                      onClick={() => handleClickButton(user)}
                      className="self-end sm:self-auto mt-2 sm:mt-0"
                    >
                      {buttonContent(user)}
                    </Button>
                  </motion.div>
                ))
              : searchQuery &&
                isSuccess && (
                  <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No users found matching {`"${searchQuery}"`}
                    </p>
                  </div>
                )}
          </AnimatePresence>

          {!searchQuery && (
            <div className="flex h-32 flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Search for users to add as friends
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
