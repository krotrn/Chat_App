import menuItemProps from "@/types/menuItems";
import { Home, MessageSquare, Settings, User, UserPlus, Users } from "lucide-react";

export const menuItems: menuItemProps[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Chats", href: "/chats", icon: MessageSquare },
  { name: "Friends", href: "/friends", icon: Users },
  { name: "Request", href: "/request", icon: UserPlus },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];
