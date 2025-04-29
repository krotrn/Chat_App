"use client";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatItem from "@/components/chat/chat-item";
import AIChatItem from "@/components/chat/ai-chat-item";
import { AIModel } from "@/types/ChatType";
import { useChat } from "@/context/ChatProvider";
import { cn } from "@/lib/utils";
import { ResizablePanel } from "../ui/resizable";

interface ChatSidebarProps {
  aiModels?: AIModel[];
}

export default function ChatSidebar({ aiModels }: ChatSidebarProps) {
  const { chats, searchChatQuery, handleChatSearch, currentChatId } = useChat();
  return (
    <ResizablePanel
      className={cn(
        "flex flex-col h-full w-full border-r",
        currentChatId && "hidden md:flex",
      )}
      minSize={20}
      defaultSize={25}
    >
      <motion.div
        className="flex h-full w-full flex-col border-r space-y-2"
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search chats..."
              className="pl-8"
              value={searchChatQuery}
              onChange={handleChatSearch}
            />
          </div>
        </div>
        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="px-2">
            <div className="space-y-1">
              {chats.length > 0 ? (
                chats.map((chat) => <ChatItem key={chat._id} chat={chat} />)
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  No chats found
                </div>
              )}
              {/* For Future Ai Models */}
              {aiModels && aiModels.length > 0 && (
                <>
                  <div className="px-2 py-2">
                    <h3 className="text-sm font-semibold">AI ASSISTANTS</h3>
                  </div>
                  {aiModels.map((model) => (
                    <AIChatItem key={model.id} model={model} />
                  ))}
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </ResizablePanel>
  );
}
