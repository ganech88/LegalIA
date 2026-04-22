"use client";

import { Sidebar } from "./sidebar";

interface SidebarWrapperProps {
  userName: string;
  plan: string;
  escritosUsados: number;
  escritosLimit: number;
}

export function SidebarWrapper(props: SidebarWrapperProps) {
  return <Sidebar {...props} />;
}
