"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  FileTextIcon,
  BookOpenIcon,
  HistoryIcon,
  SettingsIcon,
  XIcon,
  TrendingUpIcon,
  ZapIcon,
} from "./Icons";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: HomeIcon },
  { name: "Content Review", href: "/dashboard/content-review", icon: FileTextIcon },
  { name: "Brand Guidelines", href: "/dashboard/brand-guidelines", icon: BookOpenIcon },
  { name: "Brand Radar", href: "/dashboard/brand-radar", icon: TrendingUpIcon },
  { name: "Brand Repair", href: "/dashboard/brand-repair", icon: ZapIcon },
  { name: "Review History", href: "/dashboard/review-history", icon: HistoryIcon },
  { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden={true}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] bg-surface border-r border-border transform transition-transform duration-200 ease-out lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-border lg:justify-center">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-heading font-semibold text-foreground"
              aria-label="Inkloom home"
            >
              <svg
                className="w-7 h-7 text-accent"
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 26C10.477 28 6 23.523 6 16S10.477 4 16 4s14 4.477 14 10-4.477 14-14 14z"
                  fill="currentColor"
                />
                <path
                  d="M16 8c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z"
                  fill="#f8f7f4"
                />
              </svg>
              <span>Inkloom</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-md text-muted hover:text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              <XIcon />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Sidebar navigation">
            <ul className="space-y-0.5" role="list">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted hover:text-foreground hover:bg-surface-hover"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                      onClick={onClose}
                    >
                      <span
                        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                          isActive
                            ? "bg-accent-foreground/20"
                            : "bg-transparent group-hover:bg-border"
                        }`}
                        aria-hidden="true"
                      >
                        <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-accent-foreground" : "text-muted group-hover:text-foreground"}`} />
                      </span>
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-3 border-t border-border lg:hidden">
            <p className="text-xs text-muted text-center">
              Inkloom v0.1 — Evidence-backed brand governance
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
