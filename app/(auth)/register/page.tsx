import { pageMetadata } from "@/lib/site";
import SignUp from "@/components/auth/SignUp";
import { Suspense } from "react";

export const metadata = pageMetadata({
  title: "Create an account | Social Work Consultancy Ltd",
  description: "Create a free Social Work Consultancy Ltd account to enrol on courses and use learning resources.",
  path: "/register",
  index: false,
});

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <SignUp />
    </Suspense>
  );
}
