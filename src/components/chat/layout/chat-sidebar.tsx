"use client";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import {
  AIChatItem,
  ChatItem,
  CreateGroupDialog,
} from "@/components";
import { Input, ScrollArea, ResizablePanel } from "@/components/ui";
import { AIModel, ChatType } from "@/types";
import { cn } from "@/lib/utils";
import { useAppSelector, useFetchChatsInfiniteQuery } from "@/hooks";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";

interface ChatSidebarProps {
  aiModels?: AIModel[];
}

export function ChatSidebar({ aiModels }: ChatSidebarProps) {
  const [searchChatQuery, setSearchQuery] = useState<string>("");
  const { currentChat } = useAppSelector((state) => state.currentChat);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFetchChatsInfiniteQuery();

  const allChats = useMemo(
    () => data?.pages.flatMap((page) => page.chats) ?? [],
    [data]
  );

  const [filteredChats, setFilteredChats] = useState<ChatType[]>(allChats);

  const bottomTriggerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilteredChats(allChats);
  }, [allChats]);

  useEffect(() => {
    const trigger = bottomTriggerRef.current;
    const scrollArea = scrollAreaRef.current;

    if (!trigger || !scrollArea) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: scrollArea,
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(trigger);
    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    data?.pages.length,
    allChats.length,
  ]);

  const handleChatSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase();
      setSearchQuery(value);
      if (!value.trim()) {
        setFilteredChats(allChats);
      } else {
        setFilteredChats(
          allChats.filter(
            (chat) =>
              chat.name.toLowerCase().includes(value) ||
              (chat.lastMessage?.content &&
                chat.lastMessage.content.toLowerCase().includes(value))
          )
        );
      }
    },
    [allChats]
  );

  return (
    <ResizablePanel
      className={cn(
        "flex flex-col h-full w-full border-r",
        currentChat && "hidden md:flex",
      )}
      minSize={30}
      defaultSize={30}
      maxSize={70}
    >
      <motion.div
      >
        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search chats..."
              className="pl-8"
              value={searchChatQuery}
              onChange={handleChatSearch}
            />
          </div>
        </div>
        {/* Chat List */}
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="px-2">
            <div className="space-y-1">
              {filteredChats.length > 0 ? (
                <>
                  {filteredChats.map((chat) => (
                    <ChatItem key={chat._id} chat={chat} />
                  ))}
                  {/* Infinite scroll trigger */}
                  <div ref={bottomTriggerRef} className="h-1" />
                  {/* Loading indicator */}
                  {isFetchingNextPage && (
                    <div className="py-2 text-center text-sm text-muted-foreground">
                      Loading more chats...
                    </div>
                  )}
                </>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No chats found
                </div>
              )}
              <div className="flex bottom-0 justify-center items-center">
                <CreateGroupDialog />
              </div>
              {/* For Future Ai Models */}
              {aiModels && aiModels.length > 0 && (
                <>
                  <div className="px-2 py-2">
                    <h3 className="text-sm font-semibold">AI ASSISTANTS</h3>
                  </div>
                  {aiModels.map((model) => (
                    <AIChatItem key={model.id} model={model} />
                  ))}
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </ResizablePanel>
  );
}
