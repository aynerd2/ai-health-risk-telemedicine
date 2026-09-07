"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, CurrentUser, UserRole } from "@/lib/api";

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.75} stroke="currentColor" className="h-5 w-5 flex-none">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

const NAV_BY_ROLE: Record<UserRole, NavLink[]> = {
  patient: [
    { href: "/patient/dashboard", label: "Dashboard", icon: <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { href: "/patient/intake", label: "Risk Assessment", icon: <Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
    { href: "/patient/appointments", label: "Appointments", icon: <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { href: "/patient/history", label: "History", icon: <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  ],
  doctor: [
    { href: "/doctor/dashboard", label: "Dashboard", icon: <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  ],
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setRole(api.getRole());
    api.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function handleLogout() {
    api.logout();
    router.push("/login");
  }

  const links = role ? NAV_BY_ROLE[role] : [];

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-primary-700 text-sm font-bold text-white">H</div>
        <span className="text-sm font-semibold text-neutral-900">HealthPredict</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => {
          const active = pathname === link.href || pathname?.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-primary-50 text-primary-800" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-primary-700"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200 p-4">
        {user ? (
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
              {initials(user.full_name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">{user.full_name}</p>
              <p className="truncate text-xs capitalize text-neutral-500">{user.role}</p>
            </div>
          </div>
        ) : (
          <div className="mb-3 flex items-center gap-3">
            <div className="h-9 w-9 flex-none animate-pulse rounded-full bg-neutral-200" />
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 transition-colors hover:bg-danger-50 hover:text-danger-700"
        >
          <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-neutral-200 bg-white lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-primary-700 text-xs font-bold text-white">H</div>
          <span className="text-sm font-semibold text-neutral-900">HealthPredict</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100"
        >
          <Icon d="M4 6h16M4 12h16M4 18h16" />
        </button>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-neutral-900/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-soft-lg lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
