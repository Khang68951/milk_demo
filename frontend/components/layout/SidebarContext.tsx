"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarSearchContextValue {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const SidebarSearchContext = createContext<SidebarSearchContextValue>({
  searchQuery: "",
  setSearchQuery: () => {},
});

export function SidebarSearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <SidebarSearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SidebarSearchContext.Provider>
  );
}

export function useSidebarSearch() {
  return useContext(SidebarSearchContext);
}
