import type { Metadata } from "next";
import { RequestsList } from "@/components/request/request-list";
import { config } from "@/config";
import { getFriendRequests, getPendingRequests } from "@/actions/userUtils";
import { auth } from "@/auth";
import Authorized from "@/components/authorized";
import { formatRequests } from "@/lib/utils/dataFormating";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: `Friend Requests | ${config.appName}`,
  description: "Manage your friend requests",
};

export default async function RequestsPage() {
  const session = await auth();
  if (!session ||!session.user.id) {
    throw new Error("User is not authenticated");
  }

  const friendRequestResponse = await getFriendRequests([
    "id",
    "senderId",
    "receiverId",
    "status",
    "createdAt",
    "updatedAt",
    "expiresAt",
  ]);
  const requests = await formatRequests(friendRequestResponse);
  const pending = await getPendingRequests(session.user.id);
  

  return (
    <div className="w-full flex items-center justify-center py-10">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <Authorized user={session.user}>
          <div className="w-full flex items-center justify-center py-10">
            <main className="w-full max-w-4xl space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Friend Requests
                </h1>
                <p className="text-muted-foreground">
                  Manage your incoming friend requests.
                </p>
              </div>
              <RequestsList requests={requests} userId={session.user.id!} pending={pending.map(p=>p.id)} />
            </main>
          </div>
        </Authorized>
      </Suspense>
    </div>
  );
}
