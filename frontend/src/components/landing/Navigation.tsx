"use client";

import Link from "next/link";
import { MenuIcon, XIcon } from "@/components/Icons";
import { useState, useEffect } from "react";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-500 ${
        scrolled
          ? "bg-[#0d100f]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/20"
          : "bg-transparent border-b border-white/5"
      }`}
      role="banner"
    >
      <nav
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full"
        aria-label="Main navigation"
      >
        <div className="flex h-full items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2.5 font-heading text-xl font-semibold text-white transition-all hover:text-white/90"
            aria-label="Inkloom home"
          >
            <svg
              className="w-9 h-9 text-[#6BA37A] transition-transform group-hover:scale-110 group-hover:rotate-12"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <circle 
                cx="16" 
                cy="16" 
                r="14" 
                stroke="currentColor" 
                strokeWidth="2"
                className="transition-all"
              />
              <circle 
                cx="16" 
                cy="16" 
                r="6" 
                fill="#f8f7f4"
                className="transition-all group-hover:fill-[#6BA37A]"
              />
            </svg>
            <span className="tracking-tight">Inkloom</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#transformation"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group"
            >
              <span>Product</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6BA37A] transition-all group-hover:w-full" />
            </Link>
            <Link
              href="#brand-intelligence"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group"
            >
              <span>Features</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6BA37A] transition-all group-hover:w-full" />
            </Link>
            <Link
              href="/dashboard/content-review"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group"
            >
              <span>Demo</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6BA37A] transition-all group-hover:w-full" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard/brand-guidelines"
              className="px-4 py-2 rounded-lg border border-white/10 text-sm font-medium text-white/90 hover:bg-white/5 hover:border-white/20 transition-all backdrop-blur-sm"
            >
              View Guidelines
            </Link>
            <Link
              href="/dashboard/content-review"
              className="group relative overflow-hidden px-5 py-2.5 rounded-lg bg-[#6BA37A] text-[#0d100f] font-medium text-sm transition-all hover:shadow-lg hover:shadow-[#6BA37A]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6BA37A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d100f]"
            >
              <span className="relative z-10">Try the demo</span>
              <div className="absolute inset-0 bg-[#7BB88A] opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6BA37A] transition-all"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#0d100f]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8 p-8 animate-fade-in">
          <button
            className="absolute top-6 right-6 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6BA37A]"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <XIcon />
          </button>
          <div className="flex flex-col items-center gap-6">
            <Link
              href="#transformation"
              className="text-2xl font-medium text-white hover:text-[#6BA37A] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Product
            </Link>
            <Link
              href="#brand-intelligence"
              className="text-2xl font-medium text-white hover:text-[#6BA37A] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/dashboard/content-review"
              className="text-2xl font-medium text-white hover:text-[#6BA37A] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demo
            </Link>
            <div className="flex flex-col gap-4 w-full max-w-xs pt-8 border-t border-white/10">
              <Link
                href="/dashboard/brand-guidelines"
                className="px-6 py-4 rounded-xl border border-white/20 text-center font-medium text-white hover:bg-white/5 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                View Guidelines
              </Link>
              <Link
                href="/dashboard/content-review"
                className="px-6 py-4 rounded-xl bg-[#6BA37A] text-[#0d100f] text-center font-medium hover:bg-[#7BB88A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6BA37A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d100f] transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Try the demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
