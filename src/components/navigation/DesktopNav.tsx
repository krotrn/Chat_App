"use client";

import { menuItems } from "@/lib/navigation/menuItem";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NavigationMenuList } from "@/components/ui/navigation-menu";

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <NavigationMenuList className="w-screen justify-evenly" role="navigation">
      {menuItems.map((item, index) => (
        <motion.div
          key={item.href}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
          className="py-4"
        >
          <Link
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href
                ? "text-foreground"
                : "text-muted-foreground",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Link>
        </motion.div>
      ))}
    </NavigationMenuList>
  );
}

export { DesktopNav };
