"use client";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatItem from "@/components/chat/chat-item";
import AIChatItem from "@/components/chat/ai-chat-item";
import { AIModel, ChatType } from "@/types/ChatType";
import { cn } from "@/lib/utils";
import { ResizablePanel } from "@/components/ui/resizable";
import { useAppSelector } from "@/hooks/useReduxType";
import { useCallback, useEffect, useState } from "react";
import { useFetchChatsInfiniteQuery } from "@/hooks/queries/useFetchChatsInfiniteQuery";

interface ChatSidebarProps {
  aiModels?: AIModel[];
}

export default function ChatSidebar({ aiModels }: ChatSidebarProps) {
  const [searchChatQuery, setSearchQuery] = useState<string>("");
  const { currentChat } = useAppSelector((state) => state.chat);
  const { data } = useFetchChatsInfiniteQuery();
  const [filteredChats, setFilteredChats] = useState<ChatType[]>(
    data?.pages[0].chats || [],
  );
  useEffect(() => {
    if (data && data.pages[0].chats) {
      setFilteredChats(data.pages[0].chats);
    }
  }, [data]);
  const handleChatSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase();
      setSearchQuery(value);
      if (!value.trim()) {
        setFilteredChats(data?.pages[0].chats || []);
      } else {
        setFilteredChats(
          data?.pages[0].chats.filter(
            (chat) =>
              chat.name.toLowerCase().includes(value) ||
              (chat.lastMessage?.content &&
                chat.lastMessage.content.toLowerCase().includes(value)),
          ) || [],
        );
      }
    },
    [data?.pages],
  );

  return (
    <ResizablePanel
      className={cn(
        "flex flex-col h-full w-full border-r",
        currentChat && "hidden md:flex",
      )}
      minSize={20}
      defaultSize={25}
    >
      <motion.div
        className="flex h-full w-full flex-col border-r space-y-2"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
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
        <ScrollArea className="flex-1">
          <div className="px-2">
            <div className="space-y-1">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <ChatItem key={chat._id} chat={chat} />
                ))
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No chats found
                </div>
              )}
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
