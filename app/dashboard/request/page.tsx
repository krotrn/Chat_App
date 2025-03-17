import type { Metadata } from "next";
import { getUser, getIncomingFriendRequests } from "@/lib/user-service";
import { RequestsList } from "@/components/request/request-list";
import { config } from "@/config";

export const metadata: Metadata = {
  title: `Friend Requests | ${config.appName}`,
  description: "Manage your friend requests",
};

export default async function RequestsPage() {
  const user = await getUser();
  const requests = await getIncomingFriendRequests(user.id);

  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="w-full max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Friend Requests</h1>
          <p className="text-muted-foreground">
            Manage your incoming friend requests.
          </p>
        </div>

        <RequestsList requests={requests} userId={user.id} />
      </div>
    </div>
  );
}
