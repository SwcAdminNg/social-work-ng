"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Mail, Smartphone } from "lucide-react";
import { OtpInput, ResendButton, useCooldown, useOtp } from "./shared/OtpInput";
import { AuthAlert, AuthHeader } from "./shared/ui";
import { errorMessage, type SessionData } from "./shared/types";

export function TwoFactorVerify({
  challengeToken,
  method,
  onComplete,
  onBack,
}: {
  challengeToken: string;
  method: "EMAIL" | "TOTP";
  onComplete: (session: SessionData) => void;
  onBack?: () => void;
}) {
  const otp = useOtp();
  const cooldown = useCooldown();
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // The code was emailed as the sign-in started, so the first resend waits.
    if (method === "EMAIL") cooldown.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async (submittedCode: string) => {
    setError("");
    otp.verifying();
    try {
      const res = await fetch("/api/proxy/auth/2fa/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_token: challengeToken, code: submittedCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "That code didn't work. Check it and try again.");
      }
      otp.succeed();
      onComplete(data.data);
    } catch (err) {
      setError(errorMessage(err, "Something went wrong. Please try again."));
      otp.fail();
    }
  };

  const resend = async () => {
    if (cooldown.seconds > 0 || resending) return;
    setError("");
    setResending(true);
    try {
      const res = await fetch("/api/proxy/auth/2fa/login/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_token: challengeToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Could not resend the code. Please try again.");
      }
      otp.reset();
      cooldown.start();
    } catch (err) {
      setError(errorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <AuthHeader
        headingRef={headingRef}
        icon={otp.status === "success" ? "success" : method === "TOTP" ? <Smartphone size={28} strokeWidth={1.8} /> : <Mail size={28} strokeWidth={1.8} />}
        title="Two-factor authentication"
        subtitle={
          method === "TOTP"
            ? "Enter the 6-digit code from your authenticator app."
            : "A message with a verification code has been sent to your email. Enter the code to continue."
        }
      />

      {error && <AuthAlert>{error}</AuthAlert>}

      <OtpInput value={otp.code} onChange={otp.setCode} onComplete={verify} status={otp.status} autoFocus />

      <div className="au-row mt-6">
        {onBack ? (
          <button type="button" onClick={onBack} className="au-link au-link--muted">
            <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" /> Back
          </button>
        ) : (
          <span />
        )}
        {method === "EMAIL" && <ResendButton seconds={cooldown.seconds} busy={resending} onClick={resend} />}
      </div>
    </div>
  );
}
