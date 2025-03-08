import { Chat, Message, MessageReaction } from "@/types/ChatType";
import { User } from "next-auth";
import { useState } from "react";
import {AnimatePresence, motion} from 'framer-motion'

interface ChatMainProps {
  chat: Chat;
  currentUser: User;
  showDetails: boolean;
  onToggleDetails: () => void;
  onDeleteChat: (chatId: string) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
}
export default function ChatMain({
  chat,
  currentUser,
  showDetails,
  onToggleDetails,
  onDeleteChat,
  onDeleteMessage,
}: ChatMainProps) {
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const handleSendMessage = (
    content: string,
    attachments?: File[],
    replyToId?: string
  ) => {
    // TODO:Implement Send Message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      senderId: currentUser.id!,
      timestamp: new Date().toISOString(),
      status: "sent",
      replyToId,
      attachments: attachments?.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
      })),
    };

    setMessages([...messages, newMessage]);
  };

  const handleReplyToMessage = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setReplyToMessage(message);
    }
  };
  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  const handleDeleteMessage = (messageId: string, forEveryone: boolean) => {
    //TODO:Handle Delete message
    if (replyToMessage?.id === messageId) {
      setReplyToMessage(null);
    }

    setMessages(messages.filter((msg) => msg.id !== messageId));

    onDeleteMessage(messageId, forEveryone);
  };
  const handleReactToMessage = (messageId: string, emoji: string) => {
    const newReaction: MessageReaction = {
      emoji,
      userId: currentUser.id!,
      timestamp: new Date().toISOString(),
    };

    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          const existingReactionIndex =
            msg.reactions?.findIndex(
              (r) => r.userId === currentUser.id && r.emoji === emoji
            ) ?? -1;

          if (existingReactionIndex !== -1 && msg.reactions) {
            const newReactions = [...msg.reactions];
            newReactions.splice(existingReactionIndex, 1);
            return {
              ...msg,
              reactions: newReactions.length ? newReactions : undefined,
            };
          } else {
            // Add the new reaction
            const reactions = msg.reactions
              ? [...msg.reactions, newReaction]
              : [newReaction];
            return { ...msg, reactions };
          }
        }
        return msg;
      })
    );
  };
  return (
    <motion.div
      className="flex flex-1 flex-col overflow-hidden"
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
        currentUser={currentUser}
      />

      <div className="flex flex-1 overflow-hidden">
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
          {showDetails && (
            <ChatDetails
              chat={chat}
              currentUser={currentUser}
              onClose={onToggleDetails}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
