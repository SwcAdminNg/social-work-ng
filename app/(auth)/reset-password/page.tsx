import type { Metadata } from "next";
import ResetPassword from "@/components/auth/ResetPassword";
import { Suspense } from "react";
import { fetchApi } from "@/lib/fetchApi";

export const metadata: Metadata = {
  title: "Reset password | Social Work Consultancy Ltd",
  description: "Choose a new password for your Social Work Consultancy Ltd account.",
  alternates: { canonical: "/reset-password" },
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const res = await fetchApi("/home/stats", { next: { revalidate: 3600 } });
  let stats = null;
  if (res.ok) {
    const data = await res.json().catch(() => ({}));
    stats = data?.data || null;
  }

  return (
    <Suspense fallback={null}>
      <ResetPassword statsData={stats} />
    </Suspense>
  );
}
