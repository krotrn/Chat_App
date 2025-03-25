"use client";

import { useState, useCallback, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatItem from "@/components/chat/chat-item";
import AIChatItem from "@/components/chat/ai-chat-item";
import ChatListSkeleton from "@/components/skeleton/chat-list-skeleton";
import { Chat, AIModel } from "@/types/ChatType";

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  aiModels?: AIModel[];
  onAIModelSelect?: (modelId: string) => void;
  selectedAIModelId?: string | null;
}

export default function ChatSidebar({
  chats: initialChats,
  selectedChatId,
  aiModels,
  onAIModelSelect,
  selectedAIModelId,
}: ChatSidebarProps) {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      if (!value.trim()) {
        setChats(initialChats);
      } else {
        const filtered = initialChats.filter(
          (chat) =>
            chat.name.toLowerCase().includes(value.toLowerCase()) ||
            chat.lastMessage?.content
              .toLowerCase()
              .includes(value.toLowerCase())
        );
        setChats(filtered);
      }
    },
    [initialChats]
  );

  const handleChatSelect = useCallback(
    (chatId: string) => {
      router.push(`/dashboard/chats?chat=${chatId}`);
    },
    [router]
  );

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="flex h-full w-full md:w-80 flex-col border-r"
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
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
                  onClick={() => handleChatSelect(chat.id)}
                />
              ))
            ) : (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No chats found
              </div>
            )}
            {aiModels && aiModels.length > 0 && (
              <>
                <div className="px-2 py-2">
                  <h3 className="text-sm font-semibold">AI ASSISTANTS</h3>
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
            )}
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}
