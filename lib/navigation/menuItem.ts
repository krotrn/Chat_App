import menuItemProps from "@/types/menuItems";
import { Home, MessageSquare, Settings, User, UserPlus, Users } from "lucide-react";

export const menuItems: menuItemProps[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Chats", href: "/dashboard/chats", icon: MessageSquare },
  { name: "Friends", href: "/dashboard/friends", icon: Users },
  { name: "Request", href: "/dashboard/request", icon: UserPlus },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];
