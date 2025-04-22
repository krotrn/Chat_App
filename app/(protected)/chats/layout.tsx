import { cn } from "@/lib/utils";

export default function ChatsLayout({
  chatList,
  chatMain,
}: {
  children: React.ReactNode;
  chatList: React.ReactNode;
  chatMain: React.ReactNode;
}) {
  return (
    <div className="flex h-full overflow-hidden bg-background">
      {chatList}
      <section
        className={cn(
          "flex flex-col h-full flex-1",
          !chatMain && "hidden md:flex",
        )}
      >
        {chatMain}
      </section>
    </div>
  );
}
