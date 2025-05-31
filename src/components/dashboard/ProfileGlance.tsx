import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, MessageSquareMoreIcon } from "lucide-react";
import Link from "next/link";

interface ProfileGlanceProps {
  user: {
    name: string | null;
    username: string;
    avatarUrl: string | null;
    email: string;
    bio: string | null;
  };
}

const ProfileGlance = ({ user }: ProfileGlanceProps) => {
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user.username[0].toUpperCase();

  return (
    <Card className="w-full min-w-fit justify-items-center">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={user.avatarUrl || "/avatars/default.jpg"}
            alt={user.name || user.username || "User avatar"}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{user.name || user.username}</h2>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          <p className="text-sm text-muted-foreground">
            {user.email || "No Email Available"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{user.bio || "No bio available"}</p>
        <div className="flex gap-2">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="flex-1">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
          <Link href="/chats">
            <Button variant="outline" size="sm" className="flex-1">
              <MessageSquareMoreIcon className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileGlance;
