"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import ChatItem from "@/components/chat/chat-item";
import AIChatItem from "@/components/chat/ai-chat-item";
import { ChatType, AIModel } from "@/types/ChatType";

interface ChatListProps {
  chats: ChatType[];
  selectedChatId: string | null;
  aiModels?: AIModel[];
  onAIModelSelect?: (modelId: string) => void;
  selectedAIModelId?: string | null;
}

export default function ChatList({
  chats,
  selectedChatId,
  aiModels,
  onAIModelSelect,
  selectedAIModelId,
}: ChatListProps) {
  const router = useRouter();

  const handleDelete = async (forEveryone: boolean) => {
    try {
      if (forEveryone) {
        console.log("deleted for everyone");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        return;
      }
      console.log("Error deleting message");
      return;
    }
  };

  const handleChatSelect = useCallback(
    (chatId: string) => {
      router.push(`/chats?chat=${chatId}`);
    },
    [router],
  );

  return (
    <div className="px-2">
      <div className="space-y-1">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <ChatItem
              key={chat._id}
              chat={chat}
              isSelected={chat._id === selectedChatId}
              onClick={() => handleChatSelect(chat._id)}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            No chats found
          </div>
        )}
        {aiModels && aiModels.length > 0 && (
          <>
            <div className="px-2 py-2">
              <h3 className="text-sm font-semibold">AI ASSISTANTS</h3>
            </div>
            {aiModels.map((model) => (
              <AIChatItem
                key={model.id}
                model={model}
                isSelected={model.id === selectedAIModelId}
                onClick={() => onAIModelSelect && onAIModelSelect(model.id)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
