"use client";
import { Chat, Message, MessageReaction } from "@/types/ChatType";
import { User } from "next-auth";
import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatHeader from "./chat-header";
import MessageList from "./message-list";
import MessageInput from "./message-input";
import ChatDetails from "./chat-details";

interface ChatMainProps {
  chat: Chat;
  currentUser: User;
  showDetails: boolean;
  onToggleDetails: () => void;
  onDeleteChat: (chatId: string) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
  onBack?: () => void;
}

export default function ChatMain({
  chat,
  currentUser,
  showDetails,
  onToggleDetails,
  onDeleteChat,
  onDeleteMessage,
  onBack,
}: ChatMainProps) {
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  useEffect(() => {
    setMessages(chat.messages);
  }, [chat]);

  const handleSendMessage = useCallback(
    (content: string, attachments?: File[], replyToId?: string) => {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        senderId: currentUser?.id as string,
        timestamp: new Date().toISOString(),
        status: "sent",
        replyToId,
        attachments: attachments?.map((file) => ({
          url: URL.createObjectURL(file),
          type: file.type,
          name: file.name,
        })),
      };
      setMessages((prev) => [...prev, newMessage]);
    },
    [currentUser]
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

  const handleDeleteMessage = useCallback(
    (messageId: string, forEveryone: boolean) => {
      if (replyToMessage?.id === messageId) setReplyToMessage(null);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      onDeleteMessage(messageId, forEveryone);
    },
    [replyToMessage, onDeleteMessage]
  );

  const handleReactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      const newReaction: MessageReaction = {
        emoji,
        userId: currentUser?.id as string,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: msg.reactions
                  ? msg.reactions.some(
                      (r) => r.userId === currentUser?.id && r.emoji === emoji
                    )
                    ? msg.reactions.filter(
                        (r) =>
                          !(r.userId === currentUser?.id && r.emoji === emoji)
                      )
                    : [...msg.reactions, newReaction]
                  : [newReaction],
              }
            : msg
        )
      );
    },
    [currentUser]
  );

  return (
    <motion.div
      className="flex flex-1 w-full flex-col h-full bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      key={chat.id}
    >
      <ChatHeader
        chat={chat}
        onToggleDetails={onToggleDetails}
        onDeleteChat={() => onDeleteChat(chat.id)}
        onBack={onBack}
      />
      <div className="flex flex-1 h-screen overflow-hidden">
        <div className="flex flex-1 flex-col">
          <MessageList
            messages={messages}
            currentUser={currentUser}
            onDeleteMessage={handleDeleteMessage}
            onReplyMessage={handleReplyToMessage}
            onReactToMessage={handleReactToMessage}
          />
          <MessageInput
            onSendMessage={handleSendMessage}
            replyToMessage={replyToMessage}
            onCancelReply={handleCancelReply}
          />
        </div>
        <AnimatePresence>
          {showDetails && <ChatDetails onClose={onToggleDetails} />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
