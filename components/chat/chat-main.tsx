"use client";
import { Chat, Message, MessageReaction } from "@/types/ChatType";
import { User } from "next-auth";
import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatHeader from "@/components/chat/chat-header";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import ChatDetails from "@/components/chat/chat-details";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  useEffect(() => {
    setMessages(initialChat.messages);
    setChat(initialChat);
  }, [initialChat]);

  const toggleDetails = useCallback(() => setShowDetails((prev) => !prev), []);

  const handleBack = useCallback(() => {
    router.push("/dashboard/chats");
  }, [router]);

  const handleSendMessage = useCallback(
    (content: string, attachments?: File[], replyToId?: string) => {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        senderId: currentUser.id as string,
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

  const handleDeleteChat = useCallback(() => {
    router.push("/dashboard/chats");
  }, [router]);

  const handleDeleteMessage = useCallback(
    (messageId: string, forEveryone: boolean) => {
      if (replyToMessage?.id === messageId) setReplyToMessage(null);
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      void forEveryone;
    },
    [replyToMessage]
  );

  const handleReactToMessage = useCallback(
    (messageId: string, emoji: string) => {
      const newReaction: MessageReaction = {
        emoji,
        userId: currentUser.id as string,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: msg.reactions
                  ? msg.reactions.some(
                      (r) => r.userId === currentUser.id && r.emoji === emoji
                    )
                    ? msg.reactions.filter(
                        (r) =>
                          !(r.userId === currentUser.id && r.emoji === emoji)
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
