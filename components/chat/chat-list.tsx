"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import ChatItem from "@/components/chat/chat-item";
import AIChatItem from "@/components/chat/ai-chat-item";
import { Chat, AIModel } from "@/types/ChatType";

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  aiModels?: AIModel[];
  onAIModelSelect?: (modelId: string) => void;
  selectedAIModelId?: string | null;
  count: number;
}

export default function ChatList({
  chats,
  selectedChatId,
  aiModels,
  onAIModelSelect,
  selectedAIModelId,
}: ChatListProps) {
  const router = useRouter();

  const handleChatSelect = useCallback(
    (chatId: string) => {
      router.push(`/chats?chat=${chatId}`);
    },
    [router]
  );

  return (
    <div className="px-2">
      <div className="space-y-1">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={chat.id === selectedChatId}
              onClick={() => handleChatSelect(chat.id)}
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
