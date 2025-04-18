import { auth } from "@/auth";
import ChatMain from "@/components/chat/chat-main";
import { getChatById, setAuthToken } from "@/services/chat-api";

export default async function ChatMainPage({
  searchParams,
}: {
  searchParams: Promise<{ chat?: string }>;
}) {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("Unauthorized");

  const chatId = (await searchParams).chat;
  if (!chatId) {
    return null;
  }

  if (session.accessToken) {
    setAuthToken(session.accessToken);
  }

  const chat = await getChatById({ chatId });
  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Chat not found</p>
      </div>
    );
  }

  return (
    <ChatMain
      chat={chat}
      userId={session.user.id}
      currentUser={session.user}
      token={session.accessToken}
    />
  );
}
