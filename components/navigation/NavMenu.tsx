"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sheet } from "../ui/sheet";
import MobileNav from "./MobileNav";
import DesktopNav from "./DesktopNav";
import { NavigationMenu } from "../ui/navigation-menu";

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  return (
    <>
      {/* Desktop Menu */}
      <NavigationMenu className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur hidden md:flex">
        <DesktopNav pathname={pathname} />
      </NavigationMenu>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <MobileNav pathname={pathname} setIsOpen={setIsOpen} />
      </Sheet>
    </>
  );
};

export default NavMenu;
