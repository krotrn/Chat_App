import ChatSideBarSkeleton from "@/components/skeleton/chat-sidebar-skeleton";
interface ChatListLoadingProps {
  searchParams?: Promise<{ chat: string }>;
}

export default async function ChatListLoading({
  searchParams,
}: ChatListLoadingProps) {
  const params = searchParams ? await searchParams : { chat: "" };
  return <ChatSideBarSkeleton params={params} />;
}
