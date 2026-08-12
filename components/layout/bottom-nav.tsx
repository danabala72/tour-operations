"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    label: "Home",
    href: "/dashboard",
    icon: "⌂",
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
  {
    label: "More",
    href: "/settings",
    icon: "•••",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white lg:hidden">
      <div className="grid h-16 grid-cols-4">
        {menus.map((menu) => {
          const active =
            pathname === menu.href ||
            pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={[
                "flex flex-col items-center justify-center gap-1 text-[11px]",
                active
                  ? "font-medium text-gray-900"
                  : "text-gray-500",
              ].join(" ")}
            >
              <span className="text-lg">
                {menu.icon}
              </span>

              <span>{menu.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}