import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquareText } from "lucide-react";

interface UserStatsProps {
  friendCount: number;
  groupChatCount: number;
  className?: string;
}

export function UserStats({
  friendCount,
  groupChatCount,
  className = "",
}: UserStatsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Your Network</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="flex flex-col items-center p-3 bg-muted rounded-lg"
            aria-label={`${friendCount} friends`}
          >
            <Users className="h-8 w-8 mb-2 text-primary" aria-hidden="true" />
            <span className="text-2xl font-bold">{friendCount}</span>
            <span className="text-sm text-muted-foreground">Friends</span>
          </div>
          <div
            className="flex flex-col items-center p-3 bg-muted rounded-lg"
            aria-label={`${groupChatCount} group chats`}
          >
            <MessageSquareText
              className="h-8 w-8 mb-2 text-primary"
              aria-hidden="true"
            />
            <span className="text-2xl font-bold">{groupChatCount}</span>
            <span className="text-sm text-muted-foreground">Group Chats</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}