"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import ChatHeader from "@/components/chat/chat-header";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import ChatDetails from "@/components/chat/chat-details";

import { ChatType, MessageType } from "@/types/ChatType";
import { User } from "next-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { deleteOneOnOneChat, deleteChatForMe } from "@/services/chat-api";

import useChatSocket from "@/hooks/useChatSocket";
import useChatActions from "@/hooks/useChatActions";

interface ChatMainProps {
  chat: ChatType;
  currentUser: User;
}

export default function ChatMain({
  chat: initialChat,
  currentUser,
}: ChatMainProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [chat, setChat] = useState(initialChat);
  const [showDetails, setShowDetails] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<MessageType | null>(null);
  const { messages, setMessages } = useChatSocket(
    initialChat._id,
    currentUser.id!,
    initialChat.messages || []
  );

  useEffect(() => {
    setChat(initialChat);
  }, [initialChat]);

  const {
    handleSendMessage,
    handleDeleteMessage,
    handleReactToMessage,
    isLoading,
  } = useChatActions(chat._id, replyToMessage, setReplyToMessage, setMessages);

  const toggleDetails = useCallback(() => setShowDetails((prev) => !prev), []);
  const handleBack = useCallback(() => router.push("/chats"), [router]);

  const handleReplyToMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((msg) => msg._id === messageId);
      if (message) setReplyToMessage(message);
    },
    [messages]
  );

  const handleCancelReply = useCallback(() => setReplyToMessage(null), []);

  const handleDeleteChat = useCallback(
    async (chatId: string, forEveryone: boolean) => {
      try {
        if (forEveryone) {
          await deleteOneOnOneChat({ chatId });
        } else {
          await deleteChatForMe({ chatId });
        }
        router.push("/chats");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete chat");
      }
    },
    [router]
  );

  return (
    <motion.div
      className="flex flex-1 flex-col h-full bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      key={chat._id}
    >
      <ChatHeader
        chat={chat}
        onToggleDetails={toggleDetails}
        onDeleteChat={handleDeleteChat}
        onBack={isMobile ? handleBack : undefined}
      />
      <div className="flex flex-1 h-screen overflow-hidden">
        <div className="flex flex-1 flex-col">
          <MessageList
            messages={messages}
            participants = {chat.participants}
            currentUser={currentUser}
            onDeleteMessage={handleDeleteMessage}
            onReplyMessage={handleReplyToMessage}
            onReactToMessage={handleReactToMessage}
            isLoading={isLoading}
          />
          <MessageInput
            participants = {chat.participants}
            onSendMessage={handleSendMessage}
            replyToMessage={replyToMessage}
            onCancelReply={handleCancelReply}
          />
        </div>
        {showDetails && <ChatDetails onClose={toggleDetails} />}
      </div>
    </motion.div>
  );
}
