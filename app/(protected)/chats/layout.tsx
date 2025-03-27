import { cn } from "@/lib/utils";

export default async function ChatsLayout({
  chatList,
  chatMain,
  searchParams,
}: {
  chatList: React.ReactNode;
  chatMain: React.ReactNode;
  searchParams: Promise<{ chat?: string }>;
}) {
  const search = await searchParams;
  const selectedChatId = search?.chat;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div
        className={cn(
          "w-full md:w-80 border-r",
          selectedChatId && "hidden md:block"
        )}
      >
        {chatList}
      </div>
      <div className={cn("flex-1", !selectedChatId && "hidden md:block")}>
        {chatMain}
      </div>
    </div>
  );
}
