"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import ChatHeader from "@/components/chat/chat-header";
import MessageList from "@/components/chat/message-list";
import MessageInput from "@/components/chat/message-input";
import ChatDetails from "@/components/chat/chat-details";
import TypingIndicator from "@/components/chat/typing-indicator";

import { ConnectionState } from "@/types/ChatType";
import { useIsMobile } from "@/hooks/use-mobile";
import { setAuthToken } from "@/services/chat-api";

import { useChat } from "@/context/ChatProvider";
import { useChatActions } from "@/context/ChatActions";
import { WifiOff } from "lucide-react";
import { ResizablePanel } from "../ui/resizable";
import { cn } from "@/lib/utils";

export default function ChatMain() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);

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
  const { replyToMessage, handleSendMessage, handleCancelReply } =
    useChatActions();

  const toggleDetails = useCallback(() => setShowDetails((prev) => !prev), []);
  const handleBack = useCallback(() => router.push("/chats"), [router]);

  if (!chat) {
    return (
      <ResizablePanel
        className={cn(
          "h-full flex items-center justify-center",
          !currentChatId && "hidden md:flex",
        )}
        minSize={40}
      >
        <div className="hidden md:flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">No chat selected</p>
        </div>
      </ResizablePanel>
    );
  }

  return (
    <ResizablePanel minSize={40}>
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
    </ResizablePanel>
  );
}
