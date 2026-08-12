import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";


export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop */}
      <Sidebar />

      <div className="lg:pl-64">
        <Topbar />

        <main className="px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile */}
      <BottomNav />
    </div>
  );
}