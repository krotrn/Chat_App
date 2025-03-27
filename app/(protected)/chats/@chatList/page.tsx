import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { mockChats } from "@/lib/mock-data";
import ChatSidebar from "@/components/chat/chat-sidebar";

export default async function ChatListPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const chats = mockChats;
  const selectedChatId = (await searchParams).chat || null;

  return <ChatSidebar chats={chats} selectedChatId={selectedChatId} />;
}
