import { auth } from "@/auth";
import ChatMain from "@/components/chat/chat-main";
import { ChatActionsProvider } from "@/context/ChatActions";
import ChatProvider from "@/context/ChatProvider";
import { setAuthToken } from "@/services/chat-api";

export default async function ChatMainPage() {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("Unauthorized");

  if (session.accessToken) {
    setAuthToken(session.accessToken);
  }

  return (
    <ChatProvider currentUser={session.user} token={session.accessToken}>
      <ChatActionsProvider>
        <ChatMain />
      </ChatActionsProvider>
    </ChatProvider>
  );
}
