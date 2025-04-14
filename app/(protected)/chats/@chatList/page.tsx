import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ChatSidebar from "@/components/chat/chat-sidebar";
import { fetchChats, setAuthToken } from "@/services/chat-api";

export default async function ChatListPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  try {
    if (!session.accessToken) {
      throw new Error("No access token found");
    }
    
    setAuthToken(session.accessToken);
    const chats = await fetchChats();
    const selectedChatId = (await searchParams).chat || null;
    return <ChatSidebar chats={chats} selectedChatId={selectedChatId} />;
  } catch (error) {
    console.error("Error fetching chats:", error);
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Error loading chats</p>
      </div>
    );
  }
}
