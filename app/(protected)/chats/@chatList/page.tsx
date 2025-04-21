import { auth } from "@/auth";
import ChatSidebar from "@/components/chat/chat-sidebar";
import ChatProvider from "@/context/ChatProvider";

export default async function ChatListPage() {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("Unauthorized");
  if (!session.accessToken) {
    throw new Error("No access token found");
  }
  return (
    <ChatProvider currentUser={session.user} token={session.accessToken}>
      <ChatSidebar />
    </ChatProvider>
  );
}
