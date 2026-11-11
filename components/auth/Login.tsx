"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthPageShell } from "./shared/AuthPageShell";
import { FieldErrors, FloatingInput } from "./shared/FloatingInput";
import { PasswordToggle } from "./shared/PasswordToggle";
import { PasskeyButton, PasskeyContinueCard, usePasskeySignIn } from "./shared/PasskeySignIn";
import { TwoFactorSetup } from "./TwoFactorSetup";
import { TwoFactorVerify } from "./TwoFactorVerify";
import { ArrowRight } from "lucide-react";
import { AuthAlert, AuthHeader, Checkbox, ChevronLink, Divider, LegalNote, Spinner } from "./shared/ui";
import { errorMessage, type SessionData } from "./shared/types";

type Step =
  | { name: "credentials" }
  | { name: "setup"; challengeToken: string }
  | { name: "verify"; challengeToken: string; method: "EMAIL" | "TOTP" };

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [step, setStep] = useState<Step>({ name: "credentials" });
  const [finalizeError, setFinalizeError] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const passkey = usePasskeySignIn({
    identifier: email,
    keepLoggedIn,
    onError: (message) => setError(message),
    onSession: async (sessionData) => {
      setError("");
      await finalizeSession(sessionData as SessionData);
    },
  });

  const finalizeSession = async (sessionData: SessionData) => {
    setFinalizeError("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        mode: "finalize",
        session: JSON.stringify(sessionData),
      });

      if (res?.error) {
        throw new Error("Failed to sign in. Please try again.");
      }

      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      router.push(callbackUrl);
    } catch (err) {
      setFinalizeError(errorMessage(err, "Failed to sign in. Please try again."));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");

    if (!email) {
      setEmailError("Please enter your email or username.");
      emailRef.current?.focus();
      return;
    }
    if (!password) {
      setPasswordError("Please enter your password.");
      passwordRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/proxy/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: email,
          password,
          keep_logged_in: keepLoggedIn,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to sign in. Please check your credentials.");
      }

      const status = data.data?.status;
      const challengeToken = data.data?.challenge?.challenge_token;

      if (status === "two_factor_setup_required" && challengeToken) {
        setStep({ name: "setup", challengeToken });
      } else if (status === "two_factor_verification_required" && challengeToken) {
        setStep({ name: "verify", challengeToken, method: data.data.challenge.method });
      } else if (data.data?.user) {
        // Reserved "success" status: login already completed without a 2FA step.
        await finalizeSession(data.data);
      } else {
        throw new Error("Failed to sign in. Please check your credentials.");
      }
    } catch (err) {
      setError(errorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const finalizeAlert = finalizeError ? <AuthAlert>{finalizeError}</AuthAlert> : null;

  if (step.name === "setup") {
    return (
      <AuthPageShell variant="login" stage="setup">
        {finalizeAlert}
        <TwoFactorSetup
          api={{ kind: "challenge", challengeToken: step.challengeToken }}
          title="Set up two-factor authentication"
          description="Your account needs a second step before you can continue. Choose how you'd like to receive codes."
          onBack={() => setStep({ name: "credentials" })}
          onComplete={(sessionData) => finalizeSession(sessionData)}
        />
      </AuthPageShell>
    );
  }

  if (step.name === "verify") {
    return (
      <AuthPageShell variant="login" stage="verify">
        {finalizeAlert}
        <TwoFactorVerify
          challengeToken={step.challengeToken}
          method={step.method}
          onBack={() => setStep({ name: "credentials" })}
          onComplete={(sessionData) => finalizeSession(sessionData)}
        />
      </AuthPageShell>
    );
  }

  const ready = email.trim().length > 0 && password.length > 0;

  return (
    <AuthPageShell variant="login" stage="credentials">
      <AuthHeader title="Sign in" subtitle="Continue your learning with Social Work Consultancy Ltd." />

      {error && <AuthAlert>{error}</AuthAlert>}

      {passkey.continueAccount && (
        <>
          <PasskeyContinueCard
            account={passkey.continueAccount}
            busy={passkey.busy}
            onContinue={() => passkey.start(passkey.continueAccount?.email)}
            onUseAnother={() => emailRef.current?.focus()}
          />
          <Divider>or use your password</Divider>
        </>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="au-joined">
          <FloatingInput
            ref={emailRef}
            id="identifier"
            label="Email or username"
            type="text"
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (emailError) setEmailError("");
            }}
            autoComplete="username webauthn"
            required
            error={emailError}
            errorId="identifier-error"
          />
          <FloatingInput
            ref={passwordRef}
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (passwordError) setPasswordError("");
            }}
            autoComplete="current-password"
            required
            capsLockWarning
            error={passwordError}
            errorId="password-error"
            suffixSize="wide"
            suffix={
              <>
                <PasswordToggle visible={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                <button type="submit" className="au-go" data-ready={ready || undefined} disabled={loading} aria-label="Sign in" aria-busy={loading || undefined}>
                  {loading ? <Spinner size={18} /> : <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />}
                </button>
              </>
            }
          />
        </div>
        <FieldErrors
          errors={[
            { id: "identifier-error", text: emailError },
            { id: "password-error", text: passwordError },
          ]}
        />

        <div className="au-row mt-3">
          <Checkbox checked={keepLoggedIn} onChange={setKeepLoggedIn} label="Keep me signed in" />
          {loading && (
            <span className="inline-flex items-center gap-2 text-ink-3" aria-live="polite">
              <Spinner size={14} /> Signing in…
            </span>
          )}
        </div>
      </form>

      {passkey.availableForTyped && !passkey.continueAccount && (
        <>
          <Divider>or</Divider>
          <PasskeyButton busy={passkey.busy} disabled={loading} onClick={() => passkey.start(email)} />
        </>
      )}

      <div className="au-links">
        <ChevronLink href="/forgot-password">Forgot password?</ChevronLink>
        <p>
          Don&apos;t have an account? <ChevronLink href="/register">Create yours now</ChevronLink>
        </p>
      </div>

      <LegalNote action="signing in" />
    </AuthPageShell>
  );
}
