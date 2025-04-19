"use client";

import { useState, useCallback, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatItem from "@/components/chat/chat-item";
import AIChatItem from "@/components/chat/ai-chat-item";
import { ChatType, AIModel } from "@/types/ChatType";
import { deleteOneOnOneChat, setAuthToken } from "@/services/chat-api";
import { toast } from "sonner";

interface ChatSidebarProps {
  chats: ChatType[];
  userId: string;
  selectedChatId: string | null;
  aiModels?: AIModel[];
  onAIModelSelect?: (modelId: string) => void;
  selectedAIModelId?: string | null;
  token: string;
}

export default function ChatSidebar({
  chats: initialChats,
  userId,
  selectedChatId,
  aiModels,
  onAIModelSelect,
  selectedAIModelId,
  token,
}: ChatSidebarProps) {
  const [chats, setChats] = useState<ChatType[]>(initialChats);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // search in chat
  const handleSearch = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase();
      setSearchQuery(value);
      if (!value.trim()) {
        setChats(initialChats);
      } else {
        const filtered = initialChats.filter(
          (chat) =>
            chat.name.toLowerCase().includes(value) ||
            chat.lastMessage?.content.includes(value),
        );
        setChats(filtered);
      }
    },
    [initialChats],
  );

  // select chat
  const handleChatSelect = useCallback(
    (chatId: string) => {
      if(chatId !== selectedChatId)
        router.push(`/chats?chat=${chatId}`);
    },
    [router, selectedChatId],
  );

  // delete chat
  const handleDeleteChat = useCallback(
    async (chatId: string, forEveryone?: boolean) => {
      try {
        setAuthToken(token);
        await deleteOneOnOneChat({ chatId, forEveryone });
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (selectedChatId === chatId) {
          router.push("/chats");
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to delete chat");
      }
    },
    [selectedChatId, router, token],
  );

  return (
    <motion.div
      className="flex h-full w-full md:w-80 flex-col border-r space-y-2"
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
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="px-2">
          <div className="space-y-1">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <ChatItem
                  key={chat._id}
                  chat={chat}
                  userId={userId}
                  isSelected={chat._id === selectedChatId}
                  onClick={() => handleChatSelect(chat._id)}
                  onDelete={(forEveryone) =>
                    handleDeleteChat(chat._id, forEveryone)
                  }
                />
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
