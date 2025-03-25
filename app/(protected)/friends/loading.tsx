import FriendsListSkeleton from "@/components/skeleton/friend-list-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Loading() {
  return (
    <div className="w-full flex items-center justify-center py-10">
      <main className="w-full max-w-4xl space-y-4">
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
            <FriendsListSkeleton />
          </TabsContent>
          <TabsContent value="find">
            <FriendsListSkeleton />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
