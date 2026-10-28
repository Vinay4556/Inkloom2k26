"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  ChevronDownIcon,
  UserIcon,
} from "./Icons";

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setSearchOpen(false);
      setUserMenuOpen(false);
    }
  };

  return (
    <header
      className="sticky top-0 z-30 h-[var(--topbar-height)] bg-surface/80 backdrop-blur-sm border-b border-border"
      role="banner"
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-md text-muted hover:text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </button>

          <div className={`relative ${searchOpen ? "w-72" : "hidden lg:block"}`}>
            <label htmlFor="global-search" className="sr-only">
              Search
            </label>
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none w-4 h-4" />
            <input
              ref={searchRef}
              id="global-search"
              type="search"
              placeholder="Search…"
              disabled
              aria-disabled={true}
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-background border border-border text-sm text-muted placeholder:text-muted cursor-not-allowed"
              onKeyDown={handleKeyDown}
              onBlur={() => setSearchOpen(false)}
              onFocus={() => setSearchOpen(true)}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block w-px h-6 bg-border mx-1" aria-hidden="true" />

          <div className="relative" ref={userMenuRef}>
            <button
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted hover:text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <UserIcon className="w-[18px] h-[18px]" />
              <span className="hidden sm:block text-sm font-medium text-foreground">User</span>
              <ChevronDownIcon className={`${userMenuOpen ? "rotate-180" : ""} transition-transform w-4 h-4`} />
            </button>

            {userMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg bg-surface border border-border shadow-lg py-1"
                role="menu"
                onKeyDown={handleKeyDown}
              >
                <Link
                  href="/dashboard/settings"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:bg-surface-hover"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </Link>
                <hr className="my-1 border-border" />
                <button
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-hover focus-visible:outline-none focus-visible:bg-surface-hover"
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
