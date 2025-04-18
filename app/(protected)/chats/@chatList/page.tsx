import { auth } from "@/auth";
import ChatSidebar from "@/components/chat/chat-sidebar";
import { fetchChats, setAuthToken } from "@/services/chat-api";

export default async function ChatListPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string }>;
}) {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("Unauthorized");
  if (!session.accessToken) {
    throw new Error("No access token found");
  }

  setAuthToken(session.accessToken);
  const response = await fetchChats();
  console.log(response);
  const selectedChatId = (await searchParams).chat || null;
  return (
    <ChatSidebar
      userId={session.user.id}
      chats={response.chats}
      selectedChatId={selectedChatId}
      token={session.accessToken}
    />
  );
}
