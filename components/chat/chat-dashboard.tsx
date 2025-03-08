"use client";

import { mockChats } from "@/lib/mock-data";
import type { Chat } from "@/types/ChatType";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import useSearchQuery from "@/hooks/useSearchQuery";
import ChatSidebar from "./chat-sidebar";
import ChatMain from "./chat-main";

export default function ChatDashboard() {
  const session = useSession();
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [selectedChatId, setSelectedChatId] = useSearchQuery(
    "chat",
    mockChats[0]?.id || null
  );
  const currentUser: User = session.data?.user as User;
  const [showDetails, setShowDetails] = useState(false);
  const selectedChat = chats.find((chat) => chat.id === selectedChatId) || null;
  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };
  const handleSearchChats = (query: string) => {
    if (!query.trim()) {
      setChats(mockChats);
      return;
    }

    const filtered = mockChats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(query.toLowerCase()) ||
        chat.lastMessage?.content.toLowerCase().includes(query.toLowerCase())
    );

    setChats(filtered);
  };
  const handleDeleteChat = (chatId: string) => {
    setChats(chats.filter((chat) => chat.id !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(chats[0]?.id);
    }
  };

  const handleDeleteMessage = (messageId: string, forEveryone: boolean) => {
    if (!selectedChat) return;
    void forEveryone;

    const updatedChats = chats.map((chat) => {
      if (chat.id === selectedChat.id) {
        return {
          ...chat,
          messages: chat.messages.filter((msg) => msg.id !== messageId),
        };
      }
      return chat;
    });

    setChats(updatedChats);
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onChatSelect={handleChatSelect}
        onSearch={handleSearchChats}
      />

      {selectedChat ? (
        <ChatMain
          chat={selectedChat}
          currentUser={currentUser}
          showDetails={showDetails}
          onToggleDetails={toggleDetails}
          onDeleteChat={handleDeleteChat}
          onDeleteMessage={handleDeleteMessage}
        />
      ) : (
        <motion.div
          className="flex flex-1 items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="text-muted-foreground">
            Select a chat to start messaging
          </p>
        </motion.div>
      )}
    </div>
  );
}
