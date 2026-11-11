import type { Metadata } from "next";
import Login from "@/components/auth/Login";
import { Suspense } from "react";
import { fetchApi } from "@/lib/fetchApi";

export const metadata: Metadata = {
  title: "Sign in | Social Work Consultancy Ltd",
  description: "Sign in to continue your courses, mentorship and resources with Social Work Consultancy Ltd.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage() {
  const res = await fetchApi("/home/stats", { next: { revalidate: 3600 } });
  let stats = null;
  if (res.ok) {
    const data = await res.json().catch(() => ({}));
    stats = data?.data || null;
  }

  return (
    <Suspense fallback={null}>
      <Login statsData={stats} />
    </Suspense>
  );
}
