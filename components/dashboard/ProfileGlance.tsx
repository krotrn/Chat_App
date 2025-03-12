import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "next-auth";
import { Button } from "../ui/button";
import { Edit, MessageSquareMoreIcon } from "lucide-react";
import Link from "next/link";

interface ProfileGlanceProps {
  user: User;
}

const ProfileGlance = ({ user }: ProfileGlanceProps) => {
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <Card>
      <CardHeader className="flex w-full md:flex-row items-center gap-4 pb-2">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={user.avatarUrl || "/avatars/default.jpg"}
            alt={user.name || user.username || "User"}
          />
          <AvatarFallback>{initials || user.username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold">
              {user.name || user.username}{" "}
            </h2>
            <span className="text-2xl text-muted-foreground">
              ({user.username})
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {user.email || "No Email Available"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex items-center flex-col justify-center space-x-4 ">
        <p className="text-sm mb-4">{user.bio || "No bio available"}</p>
        <div>
          <div className="flex gap-2">
            <Link href="/dashboard/profile">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                <span>Edit Profile</span>
              </Button>
            </Link>
            <Link href="/dashboard/chats">
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquareMoreIcon className="h-4 w-4 mr-2" />
                <span>Messages</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileGlance;
