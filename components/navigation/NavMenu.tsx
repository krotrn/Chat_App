"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import MobileNav from "@/components/navigation/MobileNav";
import DesktopNav from "@/components/navigation/DesktopNav";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b overflow-y-hidden">
      {/* Desktop Menu */}
      <NavigationMenu className="hidden  md:flex items-center justify-center max-w-7xl mx-auto px-4 py-2">
        <DesktopNav pathname={pathname} />
      </NavigationMenu>
      {/* Mobile Menu Trigger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden top-4 left-4"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <MobileNav pathname={pathname} setIsOpen={setIsOpen} />
      </Sheet>
    </header>
  );
};

export default NavMenu;
