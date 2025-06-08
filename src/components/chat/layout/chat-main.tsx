"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectionState } from "@/types";
import {
  useIsMobile,
  useAppDispatch,
  useAppSelector,
  useFetchChatsInfiniteQuery,
  useTypingIndicator,
} from "@/hooks";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { setCurrentChat } from "@/lib/redux/slices/current-chat-slice";
import { JOIN_CHAT_ROOM, LEAVE_CHAT_ROOM } from "@/lib/redux/chatSocketActions";
import {
  ChatDetails,
  ChatHeader,
  MessageInput,
  MessageList,
  TypingIndicator,
} from "@/components";
import { ResizablePanel } from "@/components/ui";

export function ChatMain() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);
  const currentChat = useAppSelector((state) => state.currentChat.currentChat);
  const connectionState = useAppSelector(
    (state) => state.connection.connectionState
  );
  new Promise((resolve) => {
    if (connectionState === ConnectionState.CONNECTING) {
      resolve(null);
    }
  });
  const { data } = useFetchChatsInfiniteQuery();
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.user.user?.id);
  useEffect(() => {
    if (currentChat?._id) {
      dispatch({
        type: JOIN_CHAT_ROOM,
        payload: { chatId: currentChat._id },
      });
      router.push(`/chats?chat=${currentChat._id}`);
    }
    return () => {
      if (currentChat?._id) {
        dispatch({
          type: LEAVE_CHAT_ROOM,
          payload: { chatId: currentChat._id },
        });
      }
    };
  }, [currentChat?._id, dispatch, router]);
  const chat = data?.pages[0].chats.find(
    (chat) => chat._id === currentChat?._id
  );

  const { typingUserIds } = useTypingIndicator({
    chatId: currentChat?._id || null,
    currentUserId: currentUserId!,
  });

  const toggleDetails = useCallback(() => {
    setShowDetails((prev) => !prev);
  }, []);
  const handleBack = useCallback(() => {
    setShowDetails(false);
    dispatch(setCurrentChat(null));
    router.push("/chats");
  }, [router, dispatch]);

  if (!chat) {
    return (
      <ResizablePanel
        className={cn(
          "h-full flex items-center justify-center",
          !currentChat && "hidden md:flex",
        )}
        minSize={30}
        defaultSize={70}
        maxSize={70}
      >
        <div className="hidden md:flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">No chat selected</p>
        </div>
      </ResizablePanel>
    );
  }

  return (
    <ResizablePanel minSize={50} defaultSize={70}>
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
          userId={currentUserId!}
          onToggleDetails={toggleDetails}
          onBack={isMobile ? handleBack : undefined}
        />

        {connectionState === ConnectionState.FAILED && (
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

            <MessageInput participants={chat.participants} />
          </div>
          {showDetails && (
            <ChatDetails
              isAdmin={chat.admin === currentUserId}
              chat={chat}
              onClose={toggleDetails}
            />
          )}
        </div>
      </motion.div>
    </ResizablePanel>
  );
}
