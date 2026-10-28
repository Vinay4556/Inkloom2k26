"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8"
          role="main"
          tabIndex={-1}
        >
          {children}
        </main>
        <footer className="border-t border-border bg-surface px-4 py-3 lg:px-6">
          <p className="text-center text-xs text-muted">
            Website by{" "}
            <span className="font-semibold text-accent">NEURAL NETWORK</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
