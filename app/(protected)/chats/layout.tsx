import { cn } from "@/lib/utils";

export default function ChatsLayout({
  children,
  chatList,
  chatMain,
}: {
  children: React.ReactNode;
  chatList: React.ReactNode;
  chatMain: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className={cn("w-full md:w-80 border-r", !chatMain && "md:w-full")}>
        {chatList}
      </div>
      <div className={cn("flex-1", !chatMain && "hidden md:block")}>
        {chatMain || children}
      </div>
    </div>
  );
}
