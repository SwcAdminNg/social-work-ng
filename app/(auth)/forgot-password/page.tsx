import { pageMetadata } from "@/lib/site";
import ForgotPassword from "@/components/auth/ForgotPassword";
import { Suspense } from "react";

export const metadata = pageMetadata({
  title: "Forgot password | Social Work Consultancy Ltd",
  description: "Get a secure link to reset your Social Work Consultancy Ltd password.",
  path: "/forgot-password",
  index: false,
});

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPassword />
    </Suspense>
  );
}
