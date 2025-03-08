import { Menu, MessageSquare, Settings } from "lucide-react";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { menuItems } from "@/lib/navigation/menuItem";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
interface MobileNavProps {
  pathname: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function MobileNav({ pathname, setIsOpen }: MobileNavProps) {
  const mobileItems = useMemo(() => {
    return (
      <nav className="flex flex-col pt-4">
        <div className="flex flex-col space-y-3">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="mr-2">{item.name}</item.icon>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
        <div className="flex items-center border-t pt-4 mt-4">
          <Link href="/settings" onClick={() => setIsOpen(false)}>
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              aria-label="Settings"
            >
              <Settings className="" />
            </Button>
          </Link>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span className="ml-2 text-sm font-medium">User Account</span>
        </div>
      </nav>
    );
  }, [pathname, setIsOpen]);
  return (
    <>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader>
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => setIsOpen(false)}
            >
              <MessageSquare className="text-primary" />
              <SheetTitle className="font-bold">Chat App</SheetTitle>
            </Link>
          </div>
        </SheetHeader>
        {mobileItems}
      </SheetContent>
    </>
  );
}

export default MobileNav;
