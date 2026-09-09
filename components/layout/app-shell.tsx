"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onCollapse={() => setCollapsed((value) => !value)} onMobileClose={() => setMobileOpen(false)} />
      <div className={["transition-[padding] duration-200", collapsed ? "lg:pl-20" : "lg:pl-64"].join(" ")}>
        <Topbar onMenuOpen={() => setMobileOpen(true)} />
        <main className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
