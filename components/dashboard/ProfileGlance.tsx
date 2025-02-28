import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "next-auth";

interface ProfileGlanceProps {
  user: User;
}

const ProfileGlance = ({ user }: ProfileGlanceProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={user.avatarUrl || "/avatars/default.jpg"}
            alt={user.name || user.username}
          />
          <AvatarFallback>{user.username[0]}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-medium">
            {user.name}
          </p>
          <p className="text-sm">
            {user.email}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileGlance;
