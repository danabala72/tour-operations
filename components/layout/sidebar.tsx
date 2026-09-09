"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconCalendarEvent, IconChevronLeft, IconDashboard, IconSettings, IconSteeringWheel, IconX } from "@tabler/icons-react";

const menus = [
  { label: "Dashboard", href: "/dashboard", icon: IconDashboard },
  { label: "Reservations", href: "/reservations", icon: IconCalendarEvent },
  { label: "Drivers", href: "/drivers", icon: IconSteeringWheel },
  { label: "Settings", href: "/settings", icon: IconSettings },
];

type SidebarProps = { collapsed: boolean; mobileOpen: boolean; onCollapse: () => void; onMobileClose: () => void };

export function Sidebar({ collapsed, mobileOpen, onCollapse, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && <button className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden" aria-label="Close menu" onClick={onMobileClose} />}
      <aside className={["fixed inset-y-0 left-0 z-50 w-64 bg-[var(--sidebar)] transition-[width,transform] duration-200", collapsed ? "lg:w-20" : "lg:w-64", mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"].join(" ")}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <div className={["min-w-0", collapsed ? "lg:hidden" : ""].join(" ")}><div className="truncate font-semibold text-white">BTA Booking Board</div><div className="text-xs text-blue-200">Admin</div></div>
            <button type="button" onClick={onMobileClose} className="ml-auto flex size-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close menu"><IconX size={21} /></button>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {menus.map((menu) => {
              const active = pathname === menu.href || pathname.startsWith(`${menu.href}/`);
              const Icon = menu.icon;
              return <Link key={menu.href} href={menu.href} onClick={onMobileClose} title={collapsed ? menu.label : undefined} className={["flex items-center rounded-xl py-2.5 text-sm transition-colors", collapsed ? "gap-3 px-3 lg:justify-center lg:gap-0 lg:px-2" : "gap-3 px-3", active ? "bg-[var(--sidebar-active)] text-white shadow-sm" : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"].join(" ")}><Icon size={21} stroke={1.8} /><span className={collapsed ? "lg:hidden" : ""}>{menu.label}</span></Link>;
            })}
          </nav>
          <div className="hidden border-t border-white/10 p-3 lg:block">
            <button type="button" onClick={onCollapse} className={["flex w-full items-center rounded-xl py-2.5 text-sm text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white", collapsed ? "justify-center px-2" : "gap-3 px-3"].join(" ")} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}><IconChevronLeft size={21} className={collapsed ? "rotate-180" : ""} />{!collapsed && <span>Collapse</span>}</button>
          </div>
        </div>
      </aside>
    </>
  );
}
