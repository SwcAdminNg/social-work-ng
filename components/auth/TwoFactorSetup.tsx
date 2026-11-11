"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ShieldCheck, Smartphone, Mail, Copy, Check, ChevronLeft, ChevronRight, QrCode } from "lucide-react";
import { OtpInput, ResendButton, useCooldown, useOtp } from "./shared/OtpInput";
import { AuthAlert, AuthHeader, Spinner } from "./shared/ui";
import { errorMessage, type SessionData } from "./shared/types";

type SetupApi =
  | { kind: "challenge"; challengeToken: string }
  | { kind: "authenticated" };

type Method = "TOTP" | "EMAIL";
type Step = "choice" | "totp" | "email";

const ENDPOINTS = {
  challenge: {
    TOTP: {
      start: "/api/proxy/auth/2fa/setup/totp/start",
      confirm: "/api/proxy/auth/2fa/setup/totp/confirm",
    },
    EMAIL: {
      start: "/api/proxy/auth/2fa/setup/email/start",
      confirm: "/api/proxy/auth/2fa/setup/email/confirm",
    },
  },
  authenticated: {
    TOTP: {
      start: "/api/proxy/auth/2fa/totp/start",
      confirm: "/api/proxy/auth/2fa/totp/confirm",
    },
    EMAIL: {
      start: "/api/proxy/auth/2fa/email/start",
      confirm: "/api/proxy/auth/2fa/email/confirm",
    },
  },
};

/** The secret in groups of four, easier to read across to another device. */
const grouped = (secret: string) => secret.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();

export function TwoFactorSetup({
  api,
  onComplete,
  onBack,
  currentMethod,
  title = "Secure your account",
  description = "Choose how you'd like to receive your sign-in codes.",
}: {
  api: SetupApi;
  onComplete: (result: SessionData) => void;
  onBack?: () => void;
  currentMethod?: Method | null;
  title?: string;
  description?: string;
}) {
  const [step, setStep] = useState<Step>("choice");
  const [loadingMethod, setLoadingMethod] = useState<Method | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [resending, setResending] = useState(false);
  const [totpSecret, setTotpSecret] = useState("");
  const [totpQrDataUri, setTotpQrDataUri] = useState("");
  const [pendingMethod, setPendingMethod] = useState<Method | null>(null);
  const otp = useOtp();
  const cooldown = useCooldown();

  const headingRef = useRef<HTMLHeadingElement>(null);

  // Announce each new step by its heading; the email step goes straight to the code boxes instead.
  useEffect(() => {
    if (step !== "email") headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const body = (extra: Record<string, unknown> = {}) =>
    JSON.stringify(api.kind === "challenge" ? { challenge_token: api.challengeToken, ...extra } : extra);

  const selectMethod = (method: Method) => {
    if (api.kind === "authenticated") {
      setPendingMethod(method);
      return;
    }
    choose(method);
  };

  const choose = async (method: Method) => {
    setError("");
    otp.reset();
    setLoadingMethod(method);
    try {
      const res = await fetch(ENDPOINTS[api.kind][method].start, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      if (method === "TOTP") {
        setTotpSecret(data.data?.secret || "");
        setTotpQrDataUri(data.data?.qr_code_data_uri || "");
        setStep("totp");
      } else {
        cooldown.start();
        setStep("email");
      }
    } catch (err) {
      setError(errorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoadingMethod(null);
    }
  };

  const resendEmail = async () => {
    if (cooldown.seconds > 0 || resending) return;
    setError("");
    setResending(true);
    try {
      const res = await fetch(ENDPOINTS[api.kind].EMAIL.start, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body(),
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

  const confirm = async (method: Method, submittedCode: string) => {
    setError("");
    otp.verifying();
    try {
      const res = await fetch(ENDPOINTS[api.kind][method].confirm, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body({ code: submittedCode }),
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

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(totpSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can fail (e.g. insecure context); the key stays readable.
    }
  };

  const backToChoice = () => {
    setStep("choice");
    setError("");
    otp.reset();
  };

  const methods: { id: Method; title: string; text: string; icon: React.ReactNode; tile: string }[] = [
    {
      id: "TOTP",
      title: "Authenticator app",
      text: "Google Authenticator, Microsoft Authenticator or a similar app.",
      icon: <Smartphone size={20} strokeWidth={2} />,
      tile: "linear-gradient(160deg, #3d8c68, #14402f)",
    },
    {
      id: "EMAIL",
      title: "Email code",
      text: "Get a 6-digit code by email each time you sign in.",
      icon: <Mail size={20} strokeWidth={2} />,
      tile: "linear-gradient(160deg, #f3c56b, #d9603a)",
    },
  ];

  return (
    <div className="au">
      <div key={step} className="au-stage">
        <AuthHeader
          headingRef={headingRef}
          icon={
            otp.status === "success" ? (
              "success"
            ) : step === "totp" ? (
              <QrCode size={28} strokeWidth={1.8} />
            ) : step === "email" ? (
              <Mail size={28} strokeWidth={1.8} />
            ) : (
              <ShieldCheck size={30} strokeWidth={1.8} />
            )
          }
          title={step === "choice" ? title : step === "totp" ? "Scan with your app" : "Check your email"}
          subtitle={
            step === "choice"
              ? description
              : step === "totp"
                ? "Scan the code with your authenticator app, then enter the 6-digit code it shows."
                : "We sent a 6-digit code to your email address. Enter it to finish."
          }
        />

        {error && <AuthAlert>{error}</AuthAlert>}

        {step === "choice" && (
          <div className="au-list" role="list">
            {methods.map((m) => {
              const isCurrent = currentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="listitem"
                  disabled={!!loadingMethod || isCurrent}
                  onClick={() => selectMethod(m.id)}
                  className="au-list-row"
                >
                  <span className="au-tile" style={{ background: m.tile }} aria-hidden="true">
                    {m.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="au-list-title">
                      {m.title}
                      {isCurrent ? (
                        <span className="au-badge" data-tone="muted">Current</span>
                      ) : m.id === "TOTP" ? (
                        <span className="au-badge">Recommended</span>
                      ) : null}
                    </span>
                    <span className="au-list-text block">{m.text}</span>
                  </span>
                  {loadingMethod === m.id ? <Spinner size={18} className="text-ink-3" /> : <ChevronRight size={18} className="au-chev" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        )}

        {step === "totp" && (
          <div>
            {totpQrDataUri && (
              <div className="au-qr">
                <Image src={totpQrDataUri} alt="QR code to scan with your authenticator app" width={172} height={172} unoptimized />
              </div>
            )}

            {totpSecret && (
              <div className="mb-6">
                <p className="au-eyebrow">Can&apos;t scan? Enter this setup key instead</p>
                <button type="button" onClick={copySecret} className="au-key" aria-label="Copy setup key">
                  <code>{grouped(totpSecret)}</code>
                  <span className="au-key-copy" aria-live="polite">
                    {copied ? (
                      <>
                        <Check size={15} aria-hidden="true" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={15} aria-hidden="true" /> Copy
                      </>
                    )}
                  </span>
                </button>
              </div>
            )}

            <OtpInput value={otp.code} onChange={otp.setCode} onComplete={(v) => confirm("TOTP", v)} status={otp.status} />

            <div className="au-row mt-5">
              <button type="button" onClick={backToChoice} className="au-link au-link--muted">
                <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" /> Other methods
              </button>
            </div>
          </div>
        )}

        {step === "email" && (
          <div>
            <OtpInput value={otp.code} onChange={otp.setCode} onComplete={(v) => confirm("EMAIL", v)} status={otp.status} autoFocus />

            <div className="au-row mt-6">
              <button type="button" onClick={backToChoice} className="au-link au-link--muted">
                <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" /> Other methods
              </button>
              <ResendButton seconds={cooldown.seconds} busy={resending} onClick={resendEmail} />
            </div>
          </div>
        )}

        {step === "choice" && onBack && (
          <div className="au-row mt-6">
            <button type="button" onClick={onBack} className="au-link au-link--muted">
              <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" /> Back
            </button>
          </div>
        )}
      </div>

      <Dialog.Root open={!!pendingMethod} onOpenChange={(open) => !open && setPendingMethod(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="au-dialog-overlay" />
          <Dialog.Content className="au-dialog">
            <div className="au-dialog-body">
              <ShieldCheck size={34} strokeWidth={1.7} className="mx-auto text-accent" aria-hidden="true" />
              <Dialog.Title className="au-dialog-title">
                Switch to {pendingMethod === "TOTP" ? "an authenticator app" : "email codes"}?
              </Dialog.Title>
              <Dialog.Description className="au-dialog-text">
                {pendingMethod === "TOTP"
                  ? "Your current method will stop working for sign-in once the app is set up."
                  : "Your current method, including any saved authenticator app, will stop working. You'll verify with an emailed code from now on."}
              </Dialog.Description>
            </div>
            <div className="au-dialog-actions">
              <Dialog.Close asChild>
                <button type="button">Cancel</button>
              </Dialog.Close>
              <button
                type="button"
                onClick={() => {
                  const method = pendingMethod;
                  setPendingMethod(null);
                  if (method) choose(method);
                }}
              >
                Switch
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
