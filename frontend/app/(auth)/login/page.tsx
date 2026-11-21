import type { Metadata } from "next";
import { LoginView } from "@/components/auth/LoginView";

export const metadata: Metadata = {
  title: "Log in — Project A",
  description: "Sign in to your Project A shelf analytics workspace.",
};

export default function LoginPage() {
  return <LoginView />;
}
