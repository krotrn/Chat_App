import {
  getPendingRequests,
  getUserFriends,
} from "@/actions/userUtils";
import { auth } from "@/auth";
import Authorized from "@/components/authorized";
import FriendSearch from "@/components/friends/friend-search";
import FriendsList from "@/components/friends/friends-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  Suspense,
} from "react";

export default async function FriendsPage() {
  const session = await auth();
  if (!session || !session.user.id) throw new Error("unauthoriozed");
  const friends = await getUserFriends(session.user.id);
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
        <main className="w-full max-w-4xl space-y-4">
          <Authorized user={session.user}>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Friends</h1>
              <p className="text-muted-foreground">
                Manage your friends and find new connections
              </p>
            </div>
            <Tabs defaultValue="friends" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="friends">My Friends</TabsTrigger>
                <TabsTrigger value="find">Find Friends</TabsTrigger>
              </TabsList>
              <TabsContent value="friends">
                <FriendsList friends={friends} />
              </TabsContent>
              <TabsContent value="find">
                <FriendSearch
                  userId={session.user.id!}
                  pending={pending.map((p) => p.id)}
                />
              </TabsContent>
            </Tabs>
          </Authorized>
        </main>
      </Suspense>
    </div>
  );
}
