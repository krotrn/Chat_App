import { auth } from "@/auth";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import RecentChats from "@/components/dashboard/RecentChats";
import ProfileGlance from "@/components/dashboard/ProfileGlance";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  // TODO:FETCH CHATS
  const chats = [
    {
      id: "id",
      name: "chatname",
      lastMessage: "lastmessage",
      time: "time",
      avatar: "avatar",
    },
  ];
  return (
    <div className="space-y-6 overflow-y-hidden">
      <WelcomeCard userName={session.user.username} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentChats chats={chats} />
        <ProfileGlance user={session.user} />
      </div>
    </div>
  );
}
