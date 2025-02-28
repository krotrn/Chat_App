import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar?: string;
}

interface RecentChatsProps {
  chats: Chat[];
}

const RecentChats = ({ chats }: RecentChatsProps) => {
  return (
    <Card className=" shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Recent Chats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {chats.map((chat) => (
            <li key={chat.id} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={chat.avatar || `/avatars/${chat.id}.jpg`} alt={chat.name} />
                <AvatarFallback>{chat.name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium ">{chat.name}</p>
                <p className="text-sm truncate">{chat.lastMessage}</p>
              </div>
              <span className="text-xs">{chat.time}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentChats;