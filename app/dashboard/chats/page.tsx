import ChatDashboard from "@/components/chat/chat-dashboard";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ChatDashboard />
      </Suspense>
    </main>
  );
}
