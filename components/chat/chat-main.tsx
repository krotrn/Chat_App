"use client";
import { Chat, Message } from "@/types/ChatType";
import { User } from "next-auth";
import { useState, useCallback, useEffect, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatHeader from "@/components/chat/chat-header";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import ChatDetails from "@/components/chat/chat-details";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  sendMessage,
  deleteMessage,
  updateReaction,
  deleteOneOnOneChat,
  deleteChatForMe,
} from "@/services/chat-api";
import { initSocket, joinChat } from "@/lib/socket";
import { toast } from "sonner";
import { ChatEventEnum } from "@/lib/socket-event";

interface ChatMainProps {
  chat: Chat;
  currentUser: User;
}

export default function ChatMain({
  chat: initialChat,
  currentUser,
}: ChatMainProps) {
  const [messages, setMessages] = useState<Message[]>(initialChat.messages);
  const [chat, setChat] = useState<Chat>(initialChat);
  const [showDetails, setShowDetails] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const isMobile = useIsMobile();

  useEffect(() => {
    setMessages(initialChat.messages);
    setChat(initialChat);
    if (currentUser.id) {
      const socket = initSocket(currentUser.id);
      joinChat(initialChat.id);

      // Listen for new messages
      socket.on(ChatEventEnum.MESSAGE_RECEIVED_EVENT, (message: Message) => {
        if (message.chatId === initialChat.id) {
          setMessages((prev) => [...prev, message]);
        }
      });

      // Listen for message reactions
      socket.on(ChatEventEnum.MESSAGE_REACTION_EVENT, (message: Message) => {
        if (message.chatId === initialChat.id) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === message.id ? message : msg))
          );
        }
      });

      // Listen for deleted messages
      socket.on(ChatEventEnum.MESSAGE_DELETE_EVENT, (message: Message) => {
        if (message) {
          setMessages((prev) => prev.filter((msg) => msg.id !== message.id));
        }
      });

      return () => {
        socket.off(ChatEventEnum.MESSAGE_RECEIVED_EVENT);
        socket.off(ChatEventEnum.MESSAGE_REACTION_EVENT);
        socket.off(ChatEventEnum.MESSAGE_DELETE_EVENT);
      };
    }
  }, [initialChat, currentUser.id]);

  const toggleDetails = useCallback(() => setShowDetails((prev) => !prev), []);

  const handleBack = useCallback(() => {
    router.push("/chats");
  }, [router]);

  const handleSendMessage = useCallback(
    async (content: string, attachments?: File[], replyToId?: string) => {
      startTransition(async () => {
        try {
          await sendMessage({
            chatId: chat.id,
            content,
            attachments,
            replyToId,
          });
        } catch (error) {
          console.log(error);
          toast.error("Failed to send message");
        }
      });
    },
    [chat.id]
  );

  const handleReplyToMessage = useCallback(
    (messageId: string) => {
      const message = messages.find((msg) => msg.id === messageId);
      if (message) setReplyToMessage(message);
    },
    [messages]
  );

  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  const handleDeleteChat = useCallback(
    async (chatId: string, forEveryone: boolean) => {
      startTransition(async () => {
        try {
          if (forEveryone) {
            await deleteOneOnOneChat({ chatId });
          } else {
            await deleteChatForMe({ chatId });
          }
          router.push("/chats");
        } catch (error) {
          console.log(error);
          toast.error("Failed to delete chat");
        }
      });
    },
    [router]
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string, forEveryone: boolean) => {
      void forEveryone;
      startTransition(async () => {
        try {
          await deleteMessage({
            chatId: chat.id,
            messageId,
          });
          if (replyToMessage?.id === messageId) setReplyToMessage(null);
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        } catch (error) {
          console.log(error);
          toast.error("Failed to delete message");
        }
      });
    },
    [chat.id, replyToMessage]
  );

  const handleReactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      startTransition(async () => {
        try {
          const updatedMessage = await updateReaction({
            chatId: chat.id,
            messageId,
            emoji,
          });
          setMessages((prev) =>
            prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
          );
        } catch (error) {
          console.log(error);
          toast.error("Failed to update reaction");
        }
      });
    },
    [chat.id]
  );

  return (
    <motion.div
      className="flex flex-1 flex-col h-full bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      key={chat.id}
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
            currentUser={currentUser}
            onDeleteMessage={handleDeleteMessage}
            onReplyMessage={handleReplyToMessage}
            onReactToMessage={handleReactToMessage}
            isLoading={isLoading}
          />
          <MessageInput
            onSendMessage={handleSendMessage}
            replyToMessage={replyToMessage}
            onCancelReply={handleCancelReply}
          />
        </div>
        <AnimatePresence>
          {showDetails && <ChatDetails onClose={toggleDetails} />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
