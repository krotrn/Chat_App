import NavMenu from "@/components/navigation/NavMenu";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Dashboard",
  description: "A modern chat dashboard with real-time messaging",
  generator: "v0.dev",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-full ">
      <NavMenu />
      {children}
    </div>
  );
}
