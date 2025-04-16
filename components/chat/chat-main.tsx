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
  isConnectionHealthy,
} from "@/services/chat-api";

import useChatSocket from "@/hooks/useChatSocket";
import useChatActions from "@/hooks/useChatActions";
import { WifiOff } from "lucide-react";

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
    null,
  );
  
  // Get messages from socket and connection status
  const { messages: socketMessages, setMessages: setSocketMessages, isConnected } =
    useChatSocket(
      initialChat._id,
      currentUser.id!,
      token,
      initialChat.messages || [],
    );

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    socketMessages,
    (state: MessageType[], newMessage: MessageType) => {
      // Check if we're adding a new message or updating existing one
      if (!state.some((msg) => msg._id === newMessage._id)) {
        console.log(`Adding optimistic message to state: ${newMessage._id}`);
        return [...state, newMessage];
      }
      
      console.log(`Updating existing message in state: ${newMessage._id}`);
      return state.map((msg) =>
        msg._id === newMessage._id ? newMessage : msg,
      );
    },
  );

  // Update chat when initial chat changes
  useEffect(() => {
    console.log(`Initial chat updated: ${initialChat._id}, messages: ${initialChat.messages?.length || 0}`);
    setChat(initialChat);
  }, [initialChat]);
  
  // Connection status notification
  useEffect(() => {
    if (!isConnected && isConnectionHealthy() === false) {
      toast.error("Lost connection to chat server. Reconnecting...", {
        id: "socket-connection",
        duration: 3000,
      });
    } else if (isConnected) {
      toast.success("Connected to chat server", {
        id: "socket-connection",
        duration: 2000,
      });
    }
  }, [isConnected]);

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

  // Mark messages as read when chat changes
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
    [optimisticMessages],
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
    [router, token],
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
      
      {!isConnected && (
        <div className="mx-4 mt-2 p-3 bg-destructive/15 text-destructive rounded-md flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          <p>Connection to chat server lost. Messages may not be sent or received.</p>
        </div>
      )}
      
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
            disabled={!isConnected}
          />
        </div>
        {showDetails && <ChatDetails onClose={toggleDetails} />}
      </div>
    </motion.div>
  );
}
