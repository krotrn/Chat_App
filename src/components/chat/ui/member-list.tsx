"use client";
import { useState, useEffect } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { Search, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormattedFriendType } from "@/types/formattedDataTypes";
import { groupDetailsSchema } from "@/schemas/group-details";
import { z } from "zod";
import { useFetchFriendsQuery } from "@/hooks/queries/useFetchFriendsQuery";

interface MemberListProps {
  field: ControllerRenderProps<z.infer<typeof groupDetailsSchema>, "members">;
  disabled?: boolean;
}

export default function MemberList({
  field,
  disabled = false,
}: MemberListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: friends, isLoading, isFetching } = useFetchFriendsQuery();
  const [filteredFriends, setFilteredFriends] = useState<FormattedFriendType[]>(
    [],
  );
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (friends) {
      if (!searchQuery.trim()) {
        setFilteredFriends(friends);
      } else {
        const filtered = friends.filter(
          (friend) =>
            (friend.name || friend.username)
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            friend.username.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setFilteredFriends(filtered);
      }
    }
  }, [searchQuery, friends]);
  const handleMemberToggle = (
    friend: FormattedFriendType,
    checked: boolean,
  ) => {
    if (!friends) return;

    const next = new Set(selectedMembers);
    if (checked) {
      next.add(friend.id);
    } else {
      next.delete(friend.id);
    }

    const memberData = friends
      .filter((f) => next.has(f.id))
      .map((f) => ({
        userId: f.id,
        name: f.name || f.username,
        avatarUrl: f.avatarUrl || "",
        role: "member" as const,
        joinedAt: new Date(),
      }));

    field.onChange(memberData);

    setSelectedMembers(next);
  };
  const handleRemoveMember = (memberId: string) => {
    if (!friends) return;
    const next = new Set(selectedMembers);
    next.delete(memberId);
    const memberData = friends
      .filter((f) => next.has(f.id))
      .map((f) => ({
        userId: f.id,
        name: f.name || f.username,
        avatarUrl: f.avatarUrl || "",
        role: "member" as const,
        joinedAt: new Date(),
      }));

    field.onChange(memberData);
    setSelectedMembers(next);
  };

  if (isLoading || isFetching) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search friends..." className="pl-8" disabled />
        </div>
        <div className="h-32 flex items-center justify-center border border-dashed rounded-lg">
          <div className="text-sm text-muted-foreground">
            Loading friends...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Members Display */}
      {selectedMembers.size > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">
              Selected Members ({selectedMembers.size})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedMembers).map((memberId) => {
              const friend = friends?.find((f) => f.id === memberId);
              if (!friend) return null;

              return (
                <Badge
                  key={memberId}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-4 w-4">
                    <AvatarImage
                      src={friend.avatarUrl}
                      alt={friend.name || friend.username}
                    />
                    <AvatarFallback className="text-xs">
                      {(friend.name || friend.username)[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">
                    {friend.name || friend.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveMember(memberId)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search friends to add..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={disabled}
        />
      </div>

      {/* Friends List */}
      <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
        {filteredFriends.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center">
            {friends?.length === 0 ? (
              <div>
                <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any friends yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Add some friends to create group chats
                </p>
              </div>
            ) : (
              <div>
                <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No friends match &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredFriends.map((friend) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={`friend-${friend.id}`}
                  checked={selectedMembers.has(friend.id)}
                  onCheckedChange={(checked) =>
                    handleMemberToggle(friend, checked as boolean)
                  }
                  disabled={disabled}
                />
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={friend.avatarUrl}
                    alt={friend.name || friend.username}
                  />
                  <AvatarFallback>
                    {(friend.name || friend.username)[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {friend.name || friend.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    @{friend.username}
                  </p>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
