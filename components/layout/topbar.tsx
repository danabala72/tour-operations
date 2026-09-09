"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { IconBell, IconChevronDown, IconLogout, IconMenu2, IconSettings } from "@tabler/icons-react";

function getTitle(pathname: string) {
  if (pathname === "/reservations" || pathname === "/reservations/") {
    return "Reservations";
  }

  if (pathname.startsWith("/reservations/")) {
    return "Booking Details";
  }

  if (pathname.startsWith("/drivers")) {
    return "Drivers";
  }

  if (pathname.startsWith("/settings")) {
    return "Settings";
  }

  return "Dashboard";
}

export function Topbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.replace("/login");
    router.refresh();
  }

  /*
   * Close dropdown ketika klik di luar
   */
  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-white px-4 sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuOpen}
          className="flex size-9 items-center justify-center rounded-lg border lg:hidden"
          aria-label="Open menu"
        >
          <IconMenu2 size={21} />
        </button>

        <h1 className="text-base font-semibold">
          {getTitle(pathname)}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notification */}
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <IconBell size={20} />
        </button>

        {/* Account */}
        <div
          ref={menuRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setOpen((value) => !value)
            }
            className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100"
            aria-expanded={open}
            aria-haspopup="menu"
          >
            {/* User info */}
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium">
                Admin
              </div>

              <div className="text-xs text-[var(--muted)]">
                Administrator
              </div>
            </div>

            {/* Avatar */}
            <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
              A
            </div>

            {/* Arrow */}
            <IconChevronDown
              className={[
                "hidden size-4 text-slate-400 transition-transform sm:block",
                open ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>

          {/* Dropdown */}
          {open && (
            <div
              className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-lg"
              role="menu"
            >
              {/* User */}
              <div className="border-b px-4 py-3">
                <div className="text-sm font-medium">
                  Administrator
                </div>

                <div className="mt-0.5 text-xs text-[var(--muted)]">
                  Admin account
                </div>
              </div>

              {/* Menu */}
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push(
                      "/settings"
                    );
                  }}
                  className="flex cursor-pointer w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <IconSettings size={18} />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex cursor-pointer w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <IconLogout size={18} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
