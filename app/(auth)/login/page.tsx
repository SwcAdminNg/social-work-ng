import { pageMetadata } from "@/lib/site";
import Login from "@/components/auth/Login";
import { Suspense } from "react";

export const metadata = pageMetadata({
  title: "Sign in | Social Work Consultancy Ltd",
  description: "Sign in to continue your courses, mentorship and resources with Social Work Consultancy Ltd.",
  path: "/login",
  index: false,
});

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
