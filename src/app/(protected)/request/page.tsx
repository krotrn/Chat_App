import type { Metadata } from "next";
import { RequestsList } from "@/components";
import { config } from "@/config";
import { getFriendRequests } from "@/actions/user";
import { auth } from "@/auth";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: `Friend Requests | ${config.appName}`,
  description: "Manage your friend requests",
};

export default async function RequestsPage() {
  const session = await auth();
  if (!session || !session.user.id) {
    throw new Error("User is not authenticated");
  }

  const requests = await getFriendRequests();

  return (
    <div className="w-full flex items-center justify-center py-10">
      <main className="w-full max-w-4xl space-y-6 mx-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Friend Requests</h1>
          <p className="text-muted-foreground">
            Manage your incoming friend requests.
          </p>
        </div>
        <RequestsList requests={requests} />
      </main>
    </div>
  );
}
