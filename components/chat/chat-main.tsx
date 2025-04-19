"use client";
import {
  useState,
  useCallback,
  useEffect,
  useOptimistic,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import ChatHeader from "@/components/chat/chat-header";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import ChatDetails from "@/components/chat/chat-details";
import TypingIndicator from "@/components/chat/typing-indicator";

import { ChatType, MessageType } from "@/types/ChatType";
import { User } from "next-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  deleteOneOnOneChat,
  setAuthToken,
  isConnectionHealthy,
} from "@/services/chat-api";

import useChatSocket from "@/hooks/useChatSocket";
import useChatActions from "@/hooks/useChatActions";
import useTypingIndicator from "@/hooks/useTypingIndicator";
import { WifiOff } from "lucide-react";

interface ChatMainProps {
  chat: ChatType;
  userId: string;
  currentUser: User;
  token: string;
}

export default function ChatMain({
  chat: initialChat,
  userId,
  currentUser,
  token,
}: ChatMainProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [chat, setChat] = useState(initialChat);
  const [showDetails, setShowDetails] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<MessageType | undefined>(
    undefined,
  );
  const [connectionNotified, setConnectionNotified] = useState(false);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const {
    messages: socketMessages,
    setMessages: setSocketMessages,
    isConnected,
  } = useChatSocket(
    initialChat._id,
    currentUser.id!,
    token,
    initialChat.messages || [],
  );

  const { typingUserIds } = useTypingIndicator({
    chatId: initialChat._id,
    currentUserId: currentUser.id!,
  });

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    socketMessages,
    (state: MessageType[], newMessage: MessageType) => {
      const existingIndex = state.findIndex(
        (message) => message._id === newMessage._id,
      );
      if (existingIndex >= 0) {
        console.log(`Updating existing message in state: ${newMessage._id}`);
        const updatedState = [...state];
        updatedState[existingIndex] = newMessage;
        return updatedState;
      }
      if (!newMessage._id.startsWith("temp-")) {
        const tempIndex = state.findIndex(
          (msg) =>
            msg._id.startsWith("temp-") &&
            msg.content === newMessage.content &&
            msg.chatId === newMessage.chatId,
        );

        if (tempIndex >= 0) {
          console.log(
            `Replacing temp message with server message: ${newMessage._id}`,
          );
          const updatedState = [...state];
          updatedState[tempIndex] = newMessage;
          return updatedState;
        }
      }

      console.log(`Adding optimistic message to state: ${newMessage._id}`);
      return [...state, newMessage];
    },
  );

  const messagesMap = useMemo(() => {
    const map = new Map<string, MessageType>();
    optimisticMessages.forEach((msg) => map.set(msg._id, msg));
    return map;
  }, [optimisticMessages]);

  useEffect(() => {
    console.log(
      `Initial chat updated: ${initialChat._id}, messages: ${initialChat.messages?.length || 0}`,
    );
    setChat(initialChat);
  }, [initialChat]);

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

  const {
    handleSendMessage,
    handleDeleteMessage,
    handleReactToMessage,
    handleEditMessage,
    handleMarkAsRead,
    retryFailedMessage,
  } = useChatActions({
    chatId: chat._id,
    replyToMessage,
    setReplyToMessage,
    setMessages: setSocketMessages,
    addOptimisticMessage,
    currentUserId: currentUser.id,
    token,
    messagesMap,
  });

  useEffect(() => {
    if (
      chat._id &&
      socketMessages.some(
        (message) =>
          message.sender.userId !== currentUser.id &&
          !message.readBy.some((read) => read.userId === currentUser.id),
      )
    ) {
      handleMarkAsRead([]);
    }
  }, [chat._id, handleMarkAsRead, socketMessages, currentUser.id]);

  const toggleDetails = useCallback(() => setShowDetails((prev) => !prev), []);
  const handleBack = useCallback(() => router.push("/chats"), [router]);

  const handleReplyToMessage = useCallback(
    (messageId: string) => {
      const message = optimisticMessages.find(
        (prevMessage) => prevMessage._id === messageId,
      );
      if (message) setReplyToMessage(message);
    },
    [optimisticMessages],
  );

  const handleCancelReply = useCallback(() => setReplyToMessage(undefined), []);

  const handleDeleteChat = useCallback(
    async (chatId: string, forEveryone: boolean) => {
      try {
        toast.loading("Deleting chat...", { id: "delete-chat" });
        await deleteOneOnOneChat({ chatId, forEveryone });
        toast.success("Chat deleted", { id: "delete-chat" });
        router.push("/chats");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete chat", { id: "delete-chat" });
      }
    },
    [router],
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
        userId={userId}
        onToggleDetails={toggleDetails}
        onDeleteChat={handleDeleteChat}
        onBack={isMobile ? handleBack : undefined}
      />

      {!isConnected && (
        <div className="mx-4 mt-2 p-3 w-2xl bg-destructive/15 text-destructive rounded-md flex self-center gap-2">
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
            <MessageList
              messages={optimisticMessages}
              participants={chat.participants}
              currentUser={currentUser}
              onDeleteMessage={handleDeleteMessage}
              onReplyMessage={handleReplyToMessage}
              onReactToMessage={handleReactToMessage}
              onEditMessage={handleEditMessage}
              onRetryMessage={retryFailedMessage}
            />
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
