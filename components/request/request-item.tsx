import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckIcon, XIcon, BanIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RequestItemProps {
  request: {
    id: string;
    createdAt: string;
    sender: { name: string; avatar?: string };
  };
  isPending: boolean;
  onAction: (requestId: string, action: "accept" | "reject" | "block") => void;
}
export default function RequestItem({
  request,
  isPending,
  onAction,
}: RequestItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border p-4 gap-4"
    >
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={request.sender.avatar} alt={request.sender.name} />
          <AvatarFallback>
            {request.sender.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{request.sender.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(request.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 self-end sm:self-center">
        <Button
          variant="outline"
          size="sm"
          className="border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 h-9 min-w-[80px]"
          disabled={isPending}
          onClick={() => onAction(request.id, "accept")}
        >
          <CheckIcon className="mr-1 h-4 w-4" />
          <span>Accept</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 h-9 min-w-[80px]"
          disabled={isPending}
          onClick={() => onAction(request.id, "reject")}
        >
          <XIcon className="mr-1 h-4 w-4" />
          <span>Reject</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => onAction(request.id, "block")}
          className="h-9 min-w-[80px]"
        >
          <BanIcon className="mr-1 h-4 w-4" />
          <span>Block</span>
        </Button>
      </div>
    </motion.div>
  );
}
