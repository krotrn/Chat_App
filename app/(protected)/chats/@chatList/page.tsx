import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChatSidebar from "@/components/chat/chat-sidebar";
import { fetchChats } from "@/services/chat-api";

export default async function ChatListPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string; }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const chats = await fetchChats();
  const selectedChatId = (await searchParams).chat || null;

  return <ChatSidebar chats={chats} selectedChatId={selectedChatId} />;
}
