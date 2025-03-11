"use client";
import useSearchQuery from "@/hooks/useSearchQuery";
import { AIModel, Chat } from "@/types/ChatType";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { ChangeEvent, useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import ChatItem from "./chat-item";
import AIChatItem from "./ai-chat-item";
import ChatListSkeleton from "../skeleton/chat-list-skeleton";

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onSearch: (query: string) => void;
  aiModels?: AIModel[];
  onAIModelSelect?: (modelId: string) => void;
  selectedAIModelId?: string | null;
}

export default function ChatSidebar({
  chats,
  selectedChatId,
  onChatSelect,
  onSearch,
  aiModels,
  onAIModelSelect,
  selectedAIModelId,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useSearchQuery("q", "");

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };
  return (
    <motion.div
      className="flex h-full w-80 flex-col border-r"
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search chats..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Loading area */}
      <ScrollArea className="flex-1">
        <div className="px-2">
          <div className="space-y-1">
            {isInitialLoading ? (
              <ChatListSkeleton />
            ) : chats.length > 0 ? (
              chats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isSelected={chat.id === selectedChatId}
                  onClick={() => onChatSelect(chat.id)}
                />
              ))
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No chats found
              </div>
            )}
            {aiModels && aiModels.length > 0 ? (
              <>
                <div>
                  <h3>AI ASSISTANTS</h3>
                </div>
                {aiModels.map((model) => (
                  <AIChatItem
                    key={model.id}
                    model={model}
                    isSelected={model.id === selectedAIModelId}
                    onClick={() => onAIModelSelect && onAIModelSelect(model.id)}
                  />
                ))}
              </>
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No chats found
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
