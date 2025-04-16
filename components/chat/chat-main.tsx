"use client";
import { useState, useCallback, useEffect, useOptimistic } from "react";
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
import {
  deleteOneOnOneChat,
  deleteChatForMe,
  setAuthToken,
} from "@/services/chat-api";

import useChatSocket from "@/hooks/useChatSocket";
import useChatActions from "@/hooks/useChatActions";

interface ChatMainProps {
  chat: ChatType;
  currentUser: User;
  token: string;
}

export default function ChatMain({
  chat: initialChat,
  currentUser,
  token,
}: ChatMainProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [chat, setChat] = useState(initialChat);
  const [showDetails, setShowDetails] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<MessageType | null>(
    null
  );
  const { messages:socketMessages, setMessages:setSocketMessages } = useChatSocket(
    initialChat._id,
    currentUser.id!,
    token,
    initialChat.messages || []
  );

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(socketMessages, (state: MessageType[], newMessage: MessageType) =>{
    if (!state.some(msg => msg._id === newMessage._id)) {
      return [...state, newMessage];
    }
    return state.map(msg => msg._id === newMessage._id ? newMessage : msg);
  })

  useEffect(() => {
    setChat(initialChat);
  }, [initialChat]);

  const {
    handleSendMessage,
    handleDeleteMessage,
    handleReactToMessage,
    handleEditMessage,
    handleMarkAsRead,
  } = useChatActions({
    chatId: chat._id,
    replyToMessage,
    setReplyToMessage,
    setMessages: setSocketMessages,
    addOptimisticMessage,
    currentUserId: currentUser.id,
    token,
  });

  useEffect(() => {
    if (chat._id) {
      handleMarkAsRead();
    }
  }, [chat._id, handleMarkAsRead]);

  const toggleDetails = useCallback(() => setShowDetails((prev) => !prev), []);
  const handleBack = useCallback(() => router.push("/chats"), [router]);

  const handleReplyToMessage = useCallback(
    (messageId: string) => {
      const message = optimisticMessages.find((msg) => msg._id === messageId);
      if (message) setReplyToMessage(message);
    },
    [optimisticMessages]
  );

  const handleCancelReply = useCallback(() => setReplyToMessage(null), []);

  const handleDeleteChat = useCallback(
    async (chatId: string, forEveryone: boolean) => {
      try {
        setAuthToken(token);
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
    [router, token]
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
            messages={optimisticMessages}
            participants={chat.participants}
            currentUser={currentUser}
            onDeleteMessage={handleDeleteMessage}
            onReplyMessage={handleReplyToMessage}
            onReactToMessage={handleReactToMessage}
            onEditMessage={handleEditMessage}
          />
          <MessageInput
            participants={chat.participants}
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
