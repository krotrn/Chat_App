import NavMenu from "@/components/navigation/NavMenu";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <NavMenu />
      {children}
    </SessionProvider>
  );
}
