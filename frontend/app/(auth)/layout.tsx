import React from "react";
import { AuthShell } from "@/components/auth/AuthShell";

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
