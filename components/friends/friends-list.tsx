"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import useSearchQuery from "@/hooks/useSearchQuery";
import { AnimatePresence } from "framer-motion";
import FriendCard from "./friend-card";
import { useEffect, useState } from "react";
import FriendsListSkeleton from "../skeleton/friend-list-skeleton";
import { FormattedFriend } from "@/types/formattedDataTypes";
interface FriendsListProps {
  friends: FormattedFriend[];
}

export default function FriendsList({ friends }: FriendsListProps) {
  const [searchQuery, setSearchQuery] = useSearchQuery("fr", "");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filteredFriends = friends.filter((friend) =>
    (friend.name ? friend.name + friend.username : friend.username)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Friends ({friends.length})</CardTitle>
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
            disabled={isLoading}
          />
        </div>
        {isLoading ? (
          <FriendsListSkeleton />
        ) : filteredFriends.length === 0 ? (
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
              {filteredFriends.map((friend) => (
                <FriendCard friend={friend} key={friend.id} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
