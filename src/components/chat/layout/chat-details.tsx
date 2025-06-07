import { motion } from "framer-motion";
import { X, Settings, Users, Bell, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ChatType, ParticipantsType } from "@/types/ChatType";
import { useDeleteDirectChatMutation } from "@/hooks/queries/useDirectChatMutation";
import { useDeleteGroupChatMutation } from "@/hooks/queries/useGroupChatMutations";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxType";
import { useRouter } from "next/navigation";
import { setCurrentChat } from "@/lib/redux/slices/current-chat-slice";

interface ChatDetailsProps {
  onClose: () => void;
  isAdmin: boolean;
  chat: ChatType;
  currentUserId?: string;
}

export default function ChatDetails({
  onClose,
  isAdmin,
  chat,
}: ChatDetailsProps) {
  const { mutate: handleDeleteDirectChat } = useDeleteDirectChatMutation();
  const { mutate: handleDeleteGroupChat } = useDeleteGroupChatMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentChat = useAppSelector((state) => state.currentChat.currentChat);

  if (!chat) return null;
  const isGroupChat = chat.type === "group";

  const onDelete = (forEveryone: boolean) => {
    if (chat.type === "direct") {
      handleDeleteDirectChat({ chatId: chat._id, forEveryone });
    } else if (chat.type === "group") {
      handleDeleteGroupChat({ chatId: chat._id });
    }
    if (chat._id === currentChat?._id) {
      dispatch(setCurrentChat(null));
      router.push(`/chats`);
    }
  };

  return (
    <motion.div
      className="w-80 border-l bg-background"
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <h3 className="font-semibold">Chat Details</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close details"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="px-4 py-6">
          {/* Chat Info */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-20 w-20 mb-3">
              <AvatarImage src={chat.avatarUrl} alt={chat.name} />
              <AvatarFallback>
                {chat.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{chat.name}</h2>
            <p className="text-sm text-muted-foreground">
              {isGroupChat
                ? `${chat.participants.length} members`
                : "Direct Message"}
            </p>
          </div>

          <Separator className="my-4" />

          {/* Participants */}
          <div className="mb-6">
            <h3 className="flex items-center text-sm font-medium mb-3">
              <Users className="h-4 w-4 mr-2" />
              Participants
            </h3>
            <div className="space-y-3">
              {chat.participants.map((participant: ParticipantsType) => (
                <div
                  key={participant.userId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage
                        src={participant.avatarUrl}
                        alt={participant.name || "User"}
                      />
                      <AvatarFallback>
                        {(participant.name || "U")
                          .substring(0, 1)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {participant.name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {participant.userId === chat.admin ? "Admin" : "Member"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Settings */}
          <div className="mb-6">
            <h3 className="flex items-center text-sm font-medium mb-3">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  <span className="text-sm">Notifications</span>
                </div>
                <Switch />
              </div>

              {isGroupChat && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="text-sm">Privacy</span>
                  </div>
                  <Switch disabled={!isAdmin} />
                </div>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Danger Zone */}

          <h3 className="flex items-center text-sm font-medium text-destructive mb-3">
            Danger Zone
          </h3>

          {isGroupChat ? (
            <Button
              variant="destructive"
              className="w-full hover:bg-red-600 hover:transform hover:scale-105 transition-transform"
              onClick={() => chat && onDelete(isAdmin)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isAdmin ? "Delete for everyone" : "Leave chat"}
            </Button>
          ) : (
            <>
              <Button
                variant="destructive"
                className="w-full mb-2 hover:bg-red-600 hover:transform hover:scale-105 transition-transform"
                onClick={() => onDelete(false)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Chat for me
              </Button>
              <Button
                variant="destructive"
                className="w-full mt-2 hover:bg-red-600 hover:transform hover:scale-105 transition-transform"
                onClick={() => onDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Chat for everyone
              </Button>
            </>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
