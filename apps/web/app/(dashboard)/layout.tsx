import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#faf9f7]">
      {/* Subtle background glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-0 top-0 h-[600px] w-[600px] rounded-full opacity-[0.03] blur-[150px]"
        style={{ background: "#1d4ed8" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-64 bottom-0 h-[400px] w-[400px] rounded-full opacity-[0.02] blur-[120px]"
        style={{ background: "#d97706" }}
      />
      <Sidebar />
      <main className="relative md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
