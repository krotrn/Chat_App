import featureProps from "@/types/features";
import { MessageSquare, Users, Lock } from "lucide-react";

export const features: featureProps[] = [
  {
    title: "Group Chats",
    description: "Connect in vibrant group spaces.",
    icon: MessageSquare,
  },
  {
    title: "Friend Network",
    description: "Manage connections effortlessly.",
    icon: Users,
  },
  {
    title: "Secure Messaging",
    description: "Enjoy encrypted conversations.",
    icon: Lock,
  },
];
