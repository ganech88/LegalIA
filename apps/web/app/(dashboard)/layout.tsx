import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex">
      <Sidebar />
      <main className="relative flex-1 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
