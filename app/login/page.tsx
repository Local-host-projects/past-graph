import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { title: "Sign in — Past Graph" };

export default function Page() {
  return <LoginForm />;
}
