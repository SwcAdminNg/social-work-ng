"use client";

import { useState, useRef, useEffect } from "react";
import { KeyRound } from "lucide-react";
import { AuthPageShell } from "./shared/AuthPageShell";
import { FloatingInput } from "./shared/FloatingInput";
import { AuthAlert, AuthButton, AuthHeader, ChevronLink } from "./shared/ui";
import { errorMessage } from "./shared/types";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const sentHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (sent) sentHeadingRef.current?.focus();
  }, [sent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");

    if (!email) {
      setEmailError("Please enter your email address.");
      return emailRef.current?.focus();
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setEmailError("Enter a valid email address, like name@example.com.");
      return emailRef.current?.focus();
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/proxy/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to send reset link.");
      }

      setSent(true);
    } catch (err) {
      setError(errorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthPageShell variant="forgot-password" stage="sent">
        <AuthHeader
          icon="success"
          headingRef={sentHeadingRef}
          title="Check your email"
          subtitle={
            <>
              We sent a link to reset your password to <strong>{email}</strong>. It may take a minute to arrive.
            </>
          }
        />
        <AuthButton type="button" variant="quiet" onClick={() => setSent(false)}>
          Use a different email
        </AuthButton>
        <div className="au-links">
          <p>
            Didn&apos;t get it? Check your spam folder, or{" "}
            <button type="button" className="au-link" onClick={() => setSent(false)}>
              send it again
            </button>
            .
          </p>
          <ChevronLink href="/login">Back to sign in</ChevronLink>
        </div>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell variant="forgot-password" stage="form">
      <AuthHeader
        icon={<KeyRound size={28} strokeWidth={1.8} />}
        title="Reset your password"
        subtitle="Enter the email address you use with your account and we'll send you a link to choose a new password."
      />

      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={handleSubmit} noValidate className="au-form">
        <FloatingInput
          ref={emailRef}
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            if (emailError) setEmailError("");
          }}
          autoComplete="email"
          inputMode="email"
          required
          autoFocus
          error={emailError}
        />
        <AuthButton type="submit" busy={loading} busyLabel="Sending link…" className="mt-2">
          Continue
        </AuthButton>
      </form>

      <div className="au-links">
        <p>
          Remembered it? <ChevronLink href="/login">Sign in</ChevronLink>
        </p>
      </div>
    </AuthPageShell>
  );
}
