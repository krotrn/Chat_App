import { auth } from "@/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { DatabaseCheckWrapper } from "@/components";
export default async function FriendsLayout({
  friendsList,
  friendsSearch,
}: {
  friendsList: React.ReactNode;
  friendsSearch: React.ReactNode;
}) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return (
    <DatabaseCheckWrapper>
      <div className="w-full flex items-center justify-center py-10">
        <main className="w-full max-w-4xl space-y-4 mx-12">
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
            <TabsContent value="friends">{friendsList}</TabsContent>
            <TabsContent value="find">{friendsSearch}</TabsContent>
          </Tabs>
        </main>
      </div>
    </DatabaseCheckWrapper>
  );
}
