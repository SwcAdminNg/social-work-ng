import SignUp from "@/components/auth/SignUp";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <SignUp />
    </Suspense>
  );
}
