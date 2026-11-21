"use client";

import React, { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { SidebarSearchProvider } from "./SidebarContext";

interface DashboardShellProps {
  children: React.ReactNode;
}

const AUTH_PATHS = ["/login", "/register"];

// Prevents duplicate sidebars if a stale dev HMR root layout wraps a route-group layout
const InsideDashboardShellContext = createContext(false);

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const isAlreadyInsideShell = useContext(InsideDashboardShellContext);

  if (
    isAlreadyInsideShell ||
    AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return <>{children}</>;
  }

  return (
    <InsideDashboardShellContext.Provider value={true}>
      <SidebarSearchProvider>
        <div className="flex h-screen w-full overflow-hidden bg-white">
          <Sidebar />
          <main className="flex-1 min-w-0 h-full overflow-y-auto bg-white">
            {children}
          </main>
        </div>
      </SidebarSearchProvider>
    </InsideDashboardShellContext.Provider>
  );
}
