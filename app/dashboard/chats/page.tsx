import { auth } from "@/auth";
import ChatDashboard from "@/components/chat/chat-dashboard";
import { mockChats } from "@/lib/mock-data";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/login");
  return (
    <main className="h-full overflow-hidden bg-background">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ChatDashboard currentUser={session.user} fetchedChat={mockChats} />
      </Suspense>
    </main>
  );
}
