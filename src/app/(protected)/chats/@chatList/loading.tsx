import { ChatSideBarSkeleton } from "@/components";

interface ChatListLoadingProps {
  searchParams?: Promise<{ chat: string }>;
}

export default async function ChatListLoading({
  searchParams,
}: ChatListLoadingProps) {
  const params = searchParams ? await searchParams : { chat: "" };
  return <ChatSideBarSkeleton params={params} />;
}
