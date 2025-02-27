import menuItemProps from "@/types/menuItems";
import { Home, MessageSquare, Settings, User, Users } from "lucide-react";

export const menuItems: menuItemProps[] = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Chats", href: "/dashboard/chats", icon: MessageSquare },
  { name: "Friends", href: "/dashboard/friends", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];
