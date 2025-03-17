import { auth } from "@/auth";
import FriendSearch from "@/components/friends/friend-search";
import FriendsList from "@/components/friends/friends-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserFriends } from "@/lib/user-service";
import { redirect } from "next/navigation";

export default async function FriendsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const friends = await getUserFriends(session.user.id!);
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="w-full max-w-4xl space-y-4">
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
            <FriendSearch userId={session.user.id!} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
