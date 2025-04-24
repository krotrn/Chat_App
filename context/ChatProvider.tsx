"use client";

import { createContext, useState, useEffect, use, useCallback } from "react";
import useChatSocket from "@/hooks/useChatSocket";
import useTypingIndicator from "@/hooks/useTypingIndicator";
import { ChatType, ConnectionState, MessageType } from "@/types/ChatType";
import {
  deleteOneOnOneChat,
  fetchChats,
  setAuthToken,
} from "@/services/chat-api";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { User } from "next-auth";

interface ChatContextType {
  chats: ChatType[];
  setChats: React.Dispatch<React.SetStateAction<ChatType[]>>;
  loadChats: () => Promise<void>;
  currentChatId: string | null;
  setCurrentChatId: (chatId: string | null) => void;
  connectionState: ConnectionState;
  typingUserIds: string[];
  handleLocalUserTyping: () => void;
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  currentUser: User;
  messages: MessageType[];
  isConnected: boolean;
  pinnedMessageIds: string[];
  handleDeleteChat: (chatId: string, forEveryone?: boolean) => Promise<void>;
  searchChatQuery: string;
  handleChatSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  token: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = use(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: React.ReactNode;
  currentUser: User;
  token: string;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  currentUser,
  token,
}) => {
  /**
   * For storing chats.
   */
  const [chats, setChats] = useState<ChatType[]>([]);
  /**'
   * for getting search query.
   */
  const searchParams = useSearchParams();
  /**
   * For redirecting to the specific chat.
   */
  const router = useRouter();
  const [searchChatQuery, setSearchChatQuery] = useState("");

  const currentChatId = searchParams.get("chat");
  const setCurrentChatId = useCallback(
    (chatId: string | null) => {
      if (currentChatId !== chatId) {
        if (!chatId) {
          router.push("/chats");
        } else {
          router.push(`/chats?chat=${chatId}`);
        }
      }
    },
    [currentChatId, router],
  );

  if (!currentUser.id) {
    throw new Error("No current user found");
  }

  /**
   * For storing the Typing user Ids
   */
  const { typingUserIds, handleLocalUserTyping } = useTypingIndicator({
    chatId: currentChatId || "",
    currentUserId: currentUser.id,
  });

  /**
   * Load chat from server.
   */
  const loadChats = useCallback(async () => {
    try {
      setAuthToken(token);
      const response = await fetchChats();
      setChats(response.chats);
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  }, [token]);

  /**
   * update chat when a new message is received.
   */
  const handleChatUpdateFromByNewMessage = useCallback(
    (newMessage: MessageType) => {
      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (chat) => chat._id === newMessage.chatId,
        );

        if (chatIndex === -1) {
          console.warn(
            `Chat ${newMessage.chatId} not found for socket update.`,
          );
          return prevChats;
        }

        const updatedChats = [...prevChats];
        const targetChat = { ...updatedChats[chatIndex] };

        // Update last message
        if (updatedChats[chatIndex].lastMessage?._id === newMessage._id) {
          targetChat.lastMessage = newMessage;
        }

        if (!targetChat.messages.some((msg) => msg._id === newMessage._id)) {
          targetChat.messages = [...targetChat.messages, newMessage];
        }

        updatedChats[chatIndex] = targetChat;

        return updatedChats;
      });
    },
    [],
  );

  /**
   * For storing the the messages from selected chat in initial rendering.
   */
  const {
    connectionState,
    setMessages,
    messages,
    isConnected,
    pinnedMessageIds,
  } = useChatSocket(
    currentChatId || "",
    currentUser.id,
    token,
    handleChatUpdateFromByNewMessage,
  );
  useEffect(() => {
    if (currentChatId) {
      const currentChat = chats.find((chat) => chat._id === currentChatId);
      if (currentChat?.messages) {
        const filteredMessages = currentChat.messages.filter(
          (message) =>
            !message.deletedFor.some((ele) => ele.userId === currentUser.id),
        );
        setMessages(filteredMessages);
      }
    } else {
      setMessages([]);
    }
  }, [currentChatId, chats, currentUser.id, setMessages]);

  /**
   * For deleting the chat.
   */
  const handleDeleteChat = useCallback(
    async (chatId: string, forEveryone?: boolean) => {
      try {
        setAuthToken(token);
        await deleteOneOnOneChat({ chatId, forEveryone });
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        if (currentChatId === chatId) {
          router.push("/chats");
          setMessages([]);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to delete chat");
      }
    },
    [currentChatId, router, token, setMessages],
  );

  /**
   * For searching the chat.
   */
  const handleChatSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toLowerCase();
      setSearchChatQuery(value);
      if (!value.trim()) {
        loadChats();
      } else {
        setChats((prevChats) =>
          prevChats.filter(
            (chat) =>
              chat.name.toLowerCase().includes(value) ||
              (chat.lastMessage?.content &&
                chat.lastMessage.content.toLowerCase().includes(value)),
          ),
        );
      }
    },
    [loadChats],
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const chatContextValue = {
    chats,
    setChats,
    loadChats,
    currentChatId,
    setCurrentChatId,
    connectionState,
    typingUserIds,
    handleLocalUserTyping,
    setMessages,
    messages,
    currentUser,
    isConnected,
    pinnedMessageIds,
    handleDeleteChat,
    searchChatQuery,
    handleChatSearch,
    token,
  };

  return (
    <ChatContext.Provider value={chatContextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
