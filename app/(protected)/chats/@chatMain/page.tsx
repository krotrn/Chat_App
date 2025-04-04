import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChatMain from "@/components/chat/chat-main";
import { getChatById } from "@/services/chat-api";

export default async function ChatMainPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const chatId = (await searchParams).chat;
  if (!chatId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  const chat = await getChatById({ chatId });
  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Chat not found</p>
      </div>
    );
  }

  return <ChatMain chat={chat} currentUser={session.user} />;
}
