"use client";
import { mockChats } from "@/lib/mock-data";
import type { Chat } from "@/types/ChatType";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import useSearchQuery from "@/hooks/useSearchQuery";
import ChatSidebar from "./chat-sidebar";
import ChatMain from "./chat-main";

export default function ChatDashboard() {
  const session = useSession();
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [selectedChatId, setSelectedChatId] = useSearchQuery(
    "chat",
    mockChats[0]?.id || ""
  );
  const currentUser = session.data?.user as User;
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const handleChatSelect = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
    if (isMobileView) {
      setShowChatList(false); // Hide chat list on mobile when chat is selected
    }
  }, [setSelectedChatId, isMobileView]);

  const handleBackToChats = useCallback(() => {
    setShowChatList(true); // Show chat list again
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768); // 768px as mobile breakpoint
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) || null;

  const handleSearchChats = useCallback((query: string) => {
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
  }, []);

  const handleDeleteChat = useCallback((chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (selectedChatId === chatId) {
      setSelectedChatId(chats[0]?.id || "");
    }
  }, [selectedChatId, chats, setSelectedChatId]);

  const handleDeleteMessage = useCallback((messageId: string, forEveryone: boolean) => {
    if (!selectedChat) return;
    const updatedChats = chats.map((chat) =>
      chat.id === selectedChat.id
        ? { ...chat, messages: chat.messages.filter((msg) => msg.id !== messageId) }
        : chat
    );
    void forEveryone
    setChats(updatedChats);
  }, [chats, selectedChat]);

  const toggleDetails = useCallback(() => {
    setShowDetails((prev) => !prev);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
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
          <p className="text-muted-foreground">Select a chat to start messaging</p>
        </motion.div>
      )}
    </div>
  );
}