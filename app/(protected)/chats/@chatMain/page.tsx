import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { mockChats } from "@/lib/mock-data";
import ChatMain from "@/components/chat/chat-main";

export default async function ChatMainPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const selectedChatId = (await searchParams).chat;
  if (!selectedChatId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  const chat = mockChats.find((c) => c.id === selectedChatId);
  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Chat not found</p>
      </div>
    );
  }

  return <ChatMain chat={chat} currentUser={session.user} />;
}
