import { pageMetadata } from "@/lib/site";
import ResetPassword from "@/components/auth/ResetPassword";
import { Suspense } from "react";

export const metadata = pageMetadata({
  title: "Reset password | Social Work Consultancy Ltd",
  description: "Choose a new password for your Social Work Consultancy Ltd account.",
  path: "/reset-password",
  index: false,
});

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
}
