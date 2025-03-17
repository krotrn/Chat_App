"use client"
import useSearchQuery from "@/hooks/useSearchQuery";
import { searchUsers, sendFriendRequest } from "@/lib/user-service";
import { User } from "@/types/ChatType";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Search, UserPlus } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function FriendSearch({ userId }: { userId: string }) {
  const [searchQuery, setSearchQuery] = useSearchQuery("nfr", "");
  const [searchResults, setSearchResult] = useState<User[]>([]);
  const [isSearching, startTransition] = useTransition();
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    startTransition(async () => {
      try {
        const results = await searchUsers(searchQuery);
        setSearchResult(results.filter((user) => user.id !== userId));
      } catch (error) {
        console.log(error);
        toast.error("Faild to search user");
      }
    });
  };

  const handleSendRequest = async (id: string) => {
    try {
      await sendFriendRequest(userId, id);
      setPendingRequests((prev) => [...prev, userId]);
      toast.success("Friend request sent");
    } catch (error) {
      toast.error((error as Error).message || "Failed to send friend request");
    }
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
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="h-10"
          >
            {isSearching ? "Searching..." : "Search"}
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
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pendingRequests.includes(user.id)}
                      onClick={() => handleSendRequest(user.id)}
                      className="self-end sm:self-auto mt-2 sm:mt-0"
                    >
                      {pendingRequests.includes(user.id) ? (
                        "Request Sent"
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Friend
                        </>
                      )}
                    </Button>
                  </motion.div>
                ))
              : searchQuery &&
                !isSearching && (
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
