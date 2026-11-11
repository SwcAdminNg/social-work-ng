"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { AuthPageShell } from "./shared/AuthPageShell";
import { PasswordChecklist, PASSWORD_MIN } from "./shared/PasswordChecklist";
import { FloatingInput } from "./shared/FloatingInput";
import { PasswordToggle } from "./shared/PasswordToggle";
import { AuthAlert, AuthButton, AuthHeader, AuthLinkButton, ChevronLink, Spinner } from "./shared/ui";
import { errorMessage } from "./shared/types";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const doneHeadingRef = useRef<HTMLHeadingElement>(null);

  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (done) doneHeadingRef.current?.focus();
  }, [done]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!password) {
      setPasswordError("Please enter a new password.");
      return passwordRef.current?.focus();
    }
    if (password.length < PASSWORD_MIN) {
      setPasswordError(`Use at least ${PASSWORD_MIN} characters.`);
      return passwordRef.current?.focus();
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your new password.");
      return confirmPasswordRef.current?.focus();
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return confirmPasswordRef.current?.focus();
    }
    if (!token) {
      setError("This reset link is incomplete. Open the link from your email again, or request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setDone(true);
    } catch (err) {
      setError(errorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthPageShell variant="reset-password" stage="done">
        <AuthHeader
          icon="success"
          headingRef={doneHeadingRef}
          title="Password changed"
          subtitle="Your password has been reset. Use your new password the next time you sign in."
        />
        <AuthLinkButton href="/login">Continue to sign in</AuthLinkButton>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell variant="reset-password" stage="form">
      <AuthHeader
        icon={<LockKeyhole size={28} strokeWidth={1.8} />}
        title="Choose a new password"
        subtitle="Use at least 8 characters. A longer passphrase is easier to remember and harder to guess."
      />

      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={handleSubmit} noValidate className="au-form">
        <FloatingInput
          ref={passwordRef}
          id="password"
          label="New password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(v) => {
            setPassword(v);
            if (passwordError) setPasswordError("");
          }}
          autoComplete="new-password"
          required
          autoFocus
          capsLockWarning
          describedById={password ? "reset-password-rules" : undefined}
          error={passwordError}
          suffix={<PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />}
        />
        <FloatingInput
          ref={confirmPasswordRef}
          id="confirmPassword"
          label="Confirm new password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            if (confirmPasswordError) setConfirmPasswordError("");
          }}
          autoComplete="new-password"
          required
          capsLockWarning
          error={confirmPasswordError}
          suffix={<PasswordToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword((v) => !v)} />}
        />
        {password && <PasswordChecklist id="reset-password-rules" password={password} confirm={confirmPassword} />}

        <AuthButton type="submit" busy={loading} busyLabel="Saving…" className="mt-2">
          Change password
        </AuthButton>
      </form>

      <div className="au-links">
        <ChevronLink href="/login">Back to sign in</ChevronLink>
      </div>
    </AuthPageShell>
  );
}

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <AuthPageShell variant="reset-password">
          <div className="flex justify-center p-10 text-ink-3">
            <Spinner size={26} />
          </div>
        </AuthPageShell>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
