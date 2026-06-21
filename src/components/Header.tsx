"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/exercises", label: "Exerciții", short: "Ex." },
  { href: "/programs", label: "Programe", short: "Prog." },
  { href: "/session", label: "Sesiune", short: "Sesiune" },
  { href: "/stats", label: "Statistici", short: "Stats" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLogin = pathname === "/login";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  if (isLogin) return null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#06060f]/80 backdrop-blur-xl safe-top">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <Link
            href="/"
            className="min-w-0 truncate text-base font-semibold tracking-tight gradient-text sm:text-lg"
          >
            Exercise Tracker
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-2 md:flex">
            <nav className="flex items-center gap-1 text-sm">
              {links.map(({ href, label }) => {
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
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
              className="nav-link text-xs text-[var(--muted)]"
              title="Deconectare"
            >
              Ieșire
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Închide meniul" : "Deschide meniul"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Închide meniul"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute left-0 right-0 top-[calc(3.25rem+env(safe-area-inset-top))] border-b border-white/10 bg-[#0a0a14]/95 px-4 py-3 backdrop-blur-xl">
            <div className="grid gap-1">
              {links.map(({ href, label }) => {
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                      active
                        ? "bg-gradient-to-r from-violet-600/30 to-cyan-600/20 text-white"
                        : "text-zinc-300 hover:bg-white/5"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl px-4 py-3 text-left text-base text-[var(--muted)] hover:bg-white/5"
              >
                Ieșire
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#06060f]/90 backdrop-blur-xl safe-bottom md:hidden"
        aria-label="Navigație principală"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-2">
          {links.map(({ href, label, short }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] font-medium leading-tight sm:text-xs ${
                  active
                    ? "bg-violet-500/15 text-violet-200"
                    : "text-[var(--muted)]"
                }`}
              >
                <span className="truncate">{short}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
