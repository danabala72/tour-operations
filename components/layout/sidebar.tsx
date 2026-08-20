"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "▣",
  },
  {
    label: "Reservations",
    href: "/reservations",
    icon: "▤",
  },
  {
    label: "Drivers",
    href: "/drivers",
    icon: "●",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-[var(--sidebar)] lg:block">      <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <div>
          <div className="font-semibold text-white">
            BTA Booking Board
          </div>

          <div className="text-xs text-blue-200">
            Admin
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menus.map((menu) => {
          const active =
            pathname === menu.href ||
            pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-[var(--sidebar-active)] text-white shadow-sm"
                  : "text-slate-300 hover:bg-[var(--sidebar-hover)] hover:text-white"
              ].join(" ")}
            >
              <span>{menu.icon}</span>
              <span>{menu.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-[var(--sidebar-hover)] hover:text-white"
        >
          <span>⚙</span>
          <span>Settings</span>
        </Link>
      </div>
    </div>
    </aside>
  );
}