"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import ChatHeader from "@/components/chat/chat-header";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import ChatDetails from "@/components/chat/chat-details";
import TypingIndicator from "@/components/chat/typing-indicator";

import { ConnectionState } from "@/types/ChatType";
import { useIsMobile } from "@/hooks/use-mobile";
import { setAuthToken, isConnectionHealthy } from "@/services/chat-api";

import { useChat } from "@/context/ChatProvider";
import { useChatActions } from "@/context/ChatActions";
import { WifiOff } from "lucide-react";

export default function ChatMain() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);
  const [connectionNotified, setConnectionNotified] = useState(false);
  const processedMessageIdsRef = useRef(new Set<string>());

  const {
    connectionState,
    typingUserIds,
    handleDeleteChat,
    token,
    chats,
    currentChatId,
    currentUser,
  } = useChat();
  const isConnected = connectionState === ConnectionState.CONNECTED;

  const currentUserId = currentUser.id!;

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const chat = chats.find((chat) => chat._id === currentChatId);
  const {
    optimisticMessages,
    replyToMessage,
    handleSendMessage,
    handleMarkAsRead,
    handleCancelReply,
  } = useChatActions();

  useEffect(() => {
    if (
      !isConnected &&
      isConnectionHealthy() === false &&
      !connectionNotified
    ) {
      toast.error("Lost connection to chat server. Reconnecting...", {
        id: "socket-connection",
        duration: 3000,
      });
      setConnectionNotified(true);
    } else if (isConnected) {
      toast.success("Connected to chat server", {
        id: "socket-connection",
        duration: 2000,
      });
      setConnectionNotified(false);
    }
  }, [isConnected, connectionNotified]);

  useEffect(() => {
    if (!currentChatId || !optimisticMessages.length) return;

    const unreadMessageIds = optimisticMessages
      .filter(
        (message) =>
          message.sender.userId !== currentUserId &&
          !message.readBy.some((read) => read.userId === currentUserId) &&
          !processedMessageIdsRef.current.has(message._id),
      )
      .map((message) => {
        processedMessageIdsRef.current.add(message._id);
        return message._id;
      });

    if (unreadMessageIds.length > 0) {
      handleMarkAsRead(unreadMessageIds);
    }
  }, [currentChatId, handleMarkAsRead, optimisticMessages, currentUserId]);

  useEffect(() => {
    processedMessageIdsRef.current.clear();
  }, [currentChatId]);

  const toggleDetails = useCallback(() => setShowDetails((prev) => !prev), []);
  const handleBack = useCallback(() => router.push("/chats"), [router]);

  if (!chat) {
    return (
      <div className="hidden md:flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">No chat selected</p>
      </div>
    );
  }

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
        userId={currentUserId}
        onToggleDetails={toggleDetails}
        onDeleteChat={handleDeleteChat}
        onBack={isMobile ? handleBack : undefined}
      />

      {!isConnected && (
        <div className="mx-4 mt-2 p-3 w-fit bg-destructive/15 text-destructive rounded-md flex self-center gap-2">
          <WifiOff className="h-4 w-4" />
          <p>
            Connection to chat server lost. Messages may not be sent or
            received. Please wait a moment.
          </p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col h-full">
          <div className="flex-1 pl-4 overflow-hidden">
            <MessageList participants={chat.participants} />
          </div>

          <AnimatePresence>
            {typingUserIds.length > 0 && (
              <TypingIndicator
                isTyping={typingUserIds.length > 0}
                typingUserIds={typingUserIds}
                participants={chat.participants}
              />
            )}
          </AnimatePresence>

          <MessageInput
            participants={chat.participants}
            onSendMessage={handleSendMessage}
            replyToMessage={replyToMessage}
            onCancelReply={handleCancelReply}
            disabled={!isConnected}
            chatId={chat._id}
            currentUserId={currentUser.id!}
          />
        </div>
        {showDetails && <ChatDetails onClose={toggleDetails} />}
      </div>
    </motion.div>
  );
}
