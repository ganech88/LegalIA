import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Sidebar />
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
