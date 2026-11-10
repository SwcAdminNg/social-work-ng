import { pageMetadata } from "@/lib/site";
import SignUp from "@/components/auth/SignUp";
import { Suspense } from "react";
import { fetchApi } from "@/lib/fetchApi";

export const metadata = pageMetadata({
  title: "Create an account | Social Work Consultancy Ltd",
  description: "Create a free Social Work Consultancy Ltd account to enrol on courses and use learning resources.",
  path: "/register",
  index: false,
});

export default async function RegisterPage() {
  const res = await fetchApi("/home/stats", { next: { revalidate: 3600 } });
  let stats = null;
  if (res.ok) {
    const data = await res.json().catch(() => ({}));
    stats = data?.data || null;
  }

  return (
    <Suspense fallback={null}>
      <SignUp statsData={stats} />
    </Suspense>
  );
}
