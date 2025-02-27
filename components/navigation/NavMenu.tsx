"use client";
import { useMemo, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { menuItems } from "@/lib/navigation/menuItem";
import Link from "next/link";
import itemVariants from "@/animations/navigation/itemVarients";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { MenuIcon, X } from "lucide-react";

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const desktopItems = useMemo(() => {
    return menuItems.map((item) => (
      <motion.div
        key={item.name}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <NavigationMenuItem>
          <Link href={item.href}>
            <Button
              variant={pathname === item.href ? "default" : "ghost"}
              className="flex items-center space-x-2"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Button>
          </Link>
        </NavigationMenuItem>
      </motion.div>
    ));
  }, [pathname]);
  const mobileItems = useMemo(() => {
    return (
      <nav className="flex flex-col space-y-4">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            onClick={() => setIsOpen(false)}
            href={item.href}
            className={`flex items-center space-x-2 p-2 rounded-md ${
              pathname == item.href ? "bg-blue-400" : "hover:bg-blue-700"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-gray-50">{item.name}</span>
          </Link>
        ))}
      </nav>
    );
  }, [pathname]);
  return (
    <>
      {/* Desktop Menu */}
      <NavigationMenu className="hidden md:block">
        <NavigationMenuList className="flex w-screen justify-evenly">
          {desktopItems}
        </NavigationMenuList>
      </NavigationMenu>
      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle>Chat App</SheetTitle>
          </SheetHeader>
          {mobileItems}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default NavMenu;
