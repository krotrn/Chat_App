"use client";
import type { Chat } from "@/types/ChatType";
import { User } from "next-auth";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import useSearchQuery from "@/hooks/useSearchQuery";
import ChatSidebar from "./chat-sidebar";
import ChatMain from "@/components/chat/chat-main";
import { useIsMobile } from "@/hooks/use-mobile";
interface ChatDashboardProps {
  currentUser: User;
  fetchedChat: Chat[];
}

export default function ChatDashboard({
  currentUser,
  fetchedChat,
}: ChatDashboardProps) {
  const [chats, setChats] = useState<Chat[]>(fetchedChat);
  const [selectedChatId, setSelectedChatId] = useSearchQuery(
    "chat",
    fetchedChat[0]?.id || ""
  );
  const isMobileView = useIsMobile();
  const [showChatList, setShowChatList] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(
    chats.find((chat) => chat.id === selectedChatId) || null
  );

  useEffect(() => {
    setSelectedChat(chats.find((chat) => chat.id === selectedChatId) || null);
  }, [selectedChatId, chats]);
  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    if (isMobileView) {
      setShowChatList(false);
    }
  };

  const handleBackToChats = useCallback(() => {
    setShowChatList(true);
  }, []);

  const handleSearchChats = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setChats(fetchedChat);
        return;
      }
      const filtered = fetchedChat.filter(
        (chat) =>
          chat.name.toLowerCase().includes(query.toLowerCase()) ||
          chat.lastMessage?.content.toLowerCase().includes(query.toLowerCase())
      );
      setChats(filtered);
    },
    [fetchedChat]
  );

  const handleDeleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (selectedChatId === chatId) {
        setSelectedChatId(chats[0]?.id || "");
      }
    },
    [selectedChatId, chats, setSelectedChatId]
  );

  const handleDeleteMessage = useCallback(
    (messageId: string, forEveryone: boolean) => {
      if (!selectedChat) return;
      const updatedChats = chats.map((chat) =>
        chat.id === selectedChat?.id
          ? {
              ...chat,
              messages: chat.messages.filter((msg) => msg.id !== messageId),
            }
          : chat
      );
      void forEveryone;
      setChats(updatedChats);
    },
    [chats, selectedChat]
  );

  const toggleDetails = useCallback(() => {
    setShowDetails((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen  w-full overflow-hidden bg-background">
      {(!isMobileView || showChatList) && (
        <ChatSidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onChatSelect={handleChatSelect}
          onSearch={handleSearchChats}
        />
      )}
      {selectedChat && (!isMobileView || !showChatList) && (
        <ChatMain
          chat={selectedChat}
          currentUser={currentUser}
          showDetails={showDetails}
          onToggleDetails={toggleDetails}
          onDeleteChat={handleDeleteChat}
          onDeleteMessage={handleDeleteMessage}
          onBack={isMobileView ? handleBackToChats : undefined}
        />
      )}
      {!selectedChat && (
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
