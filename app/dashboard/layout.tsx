import NavMenu from "@/components/navigation/NavMenu";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavMenu />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
