import type { Metadata } from "next";
import { RegisterView } from "@/components/auth/RegisterView";

export const metadata: Metadata = {
  title: "Sign up — Project A",
  description: "Create a Project A shelf analytics workspace account.",
};

export default function RegisterPage() {
  return <RegisterView />;
}
