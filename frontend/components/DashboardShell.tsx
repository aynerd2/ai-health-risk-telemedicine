"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function DashboardShell({
  title,
  links,
  children,
}: {
  title: string;
  links?: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const router = useRouter();

  function handleLogout() {
    api.logout();
    router.push("/login");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800 hover:underline">
          Log out
        </button>
      </div>
      {links && links.length > 0 && (
        <nav className="mb-8 flex flex-wrap gap-3 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded border border-gray-200 px-3 py-1.5 hover:bg-gray-50">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
      {children}
    </main>
  );
}
