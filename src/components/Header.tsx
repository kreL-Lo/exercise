"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/exercises", label: "Exerciții" },
  { href: "/programs", label: "Programe" },
  { href: "/session", label: "Sesiune" },
  { href: "/stats", label: "Statistici" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/login";

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  if (isLogin) return null;

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-[#06060f]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight gradient-text"
        >
          Exercise Tracker
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 text-sm">
            {links.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${active ? "nav-link-active" : ""}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="nav-link ml-1 text-xs text-[var(--muted)]"
            title="Deconectare"
          >
            Ieșire
          </button>
        </div>
      </div>
    </header>
  );
}
