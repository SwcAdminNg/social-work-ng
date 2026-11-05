import type { Metadata } from "next";
import ForgotPassword from "@/components/auth/ForgotPassword";
import { Suspense } from "react";
import { fetchApi } from "@/lib/fetchApi";

export const metadata: Metadata = {
  title: "Forgot password | Social Work Consultancy Ltd",
  description: "Get a secure link to reset your Social Work Consultancy Ltd password.",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  const res = await fetchApi("/home/stats", { next: { revalidate: 3600 } });
  let stats = null;
  if (res.ok) {
    const data = await res.json().catch(() => ({}));
    stats = data?.data || null;
  }

  return (
    <Suspense fallback={null}>
      <ForgotPassword statsData={stats} />
    </Suspense>
  );
}
