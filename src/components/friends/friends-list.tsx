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
import { useState, useEffect } from "react";
import { useFetchFriendsQuery } from "@/hooks/queries/useFetchFriendsQuery";
import FriendsListSkeleton from "../skeleton/friend-list-skeleton";

export default function FriendsList() {
  const [searchQuery, setSearchQuery] = useSearchQuery("fr", "");
  const { data: friends, isFetching } = useFetchFriendsQuery();
  const [filteredFriends, setFilteredFriends] = useState<FormattedFriendType[]>(
    friends || [],
  );

  useEffect(() => {
    if (friends) {
      setFilteredFriends(
        friends.filter((friend) =>
          (friend.name ? friend.name + friend.username : friend.username)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        ),
      );
    }
  }, [friends, searchQuery]);

  if (isFetching) {
    return <FriendsListSkeleton />
  }

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
                <FriendCard friend={friend} key={friend.id} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
