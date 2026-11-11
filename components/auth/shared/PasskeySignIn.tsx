"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Fingerprint } from "lucide-react";
import {
  autofillSupported,
  cancelPasskeyCeremony,
  checkPasskeyAvailable,
  findRememberedAccount,
  forgetPasskeyAccount,
  getRememberedAccounts,
  getServerRememberedAccounts,
  type PasskeyError,
  passkeysSupported,
  type RememberedAccount,
  signInWithPasskey,
  subscribeRememberedAccounts,
} from "@/lib/passkeys";
import { Spinner } from "./ui";

const noopSubscribe = () => () => {};
const useSupported = () => useSyncExternalStore(noopSubscribe, passkeysSupported, () => false);
const useRemembered = () =>
  useSyncExternalStore(subscribeRememberedAccounts, getRememberedAccounts, getServerRememberedAccounts);

type Callbacks = {
  onSession: (sessionData: unknown) => Promise<void> | void;
  onError: (message: string) => void;
};

/**
 * Smart passkey sign-in state for a sign-in form.
 *
 * The fingerprint option appears only when it can work: for an account this
 * device has used a passkey with before, or — once an email or username is typed
 * — when the API confirms that account has a passkey for this site. Saved
 * passkeys are also offered in the username field's autofill, which the browser
 * only shows when the device really has one.
 */
export function usePasskeySignIn({ identifier, keepLoggedIn, onSession, onError }: Callbacks & { identifier: string; keepLoggedIn: boolean }) {
  const supported = useSupported();
  const remembered = useRemembered();
  const [busy, setBusy] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);
  const handlers = useRef<Callbacks>({ onSession, onError });
  useEffect(() => {
    handlers.current = { onSession, onError };
  }, [onSession, onError]);

  const typed = identifier.trim();
  const typedKey = typed.toLowerCase();
  const rememberedMatch = typed ? findRememberedAccount(typed, remembered) : null;

  // Ask the API about a typed identifier, after a pause in typing.
  useEffect(() => {
    if (!supported || typed.length < 3 || rememberedMatch) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const available = await checkPasskeyAvailable(typed, controller.signal);
      if (!controller.signal.aborted) setDetected(available ? typedKey : null);
    }, 550);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [supported, typed, typedKey, rememberedMatch]);

  // Passkeys in the username field's autofill.
  useEffect(() => {
    if (!supported) return;
    let active = true;
    autofillSupported().then((ok) => {
      if (!ok || !active) return;
      signInWithPasskey({ autofill: true })
        .then(async (session) => {
          if (!active) return;
          setBusy(true);
          await handlers.current.onSession(session);
        })
        .catch((error: PasskeyError) => {
          // Background request: only speak up when a chosen passkey was refused.
          if (active && !error.cancelled && (error.status === 401 || error.status === 403)) {
            handlers.current.onError(error.message);
          }
        });
    });
    return () => {
      active = false;
      cancelPasskeyCeremony();
    };
  }, [supported]);

  const start = async (forIdentifier?: string) => {
    setBusy(true);
    try {
      const session = await signInWithPasskey({ identifier: forIdentifier || undefined, keepLoggedIn });
      await handlers.current.onSession(session);
    } catch (error) {
      const e = error as PasskeyError;
      if (!e.cancelled) handlers.current.onError(e.message);
      // A passkey that no longer exists: stop suggesting it for this account.
      if (e.status === 401 && forIdentifier) forgetPasskeyAccount(forIdentifier);
      setBusy(false);
    }
  };

  return {
    supported,
    busy,
    start,
    /** The account to offer "Continue as" for, when nothing has been typed yet. */
    continueAccount: supported && !typed ? remembered[0] ?? null : null,
    /** Whether to offer the fingerprint button for the typed identifier. */
    availableForTyped: supported && !!typed && (!!rememberedMatch || detected === typedKey),
  };
}

const initials = (account: RememberedAccount) =>
  (account.name || account.email)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

/** "Continue as …" for the account this device last used a passkey with. */
export function PasskeyContinueCard({
  account,
  busy,
  onContinue,
  onUseAnother,
}: {
  account: RememberedAccount;
  busy: boolean;
  onContinue: () => void;
  onUseAnother: () => void;
}) {
  return (
    <div className="mb-2">
      <div className="au-account">
        <span className="au-avatar" aria-hidden="true">
          {initials(account) || "?"}
        </span>
        <p className="au-account-name">{account.name || account.email}</p>
        {account.name && <p className="au-account-mail">{account.email}</p>}
      </div>
      <button type="button" onClick={onContinue} disabled={busy} data-busy={busy || undefined} className="au-btn mt-4">
        <span key={busy ? "busy" : "idle"} className="au-btn-label">
          {busy ? <Spinner size={18} /> : <Fingerprint size={22} aria-hidden="true" />}
          {busy ? "Waiting for your fingerprint or face…" : "Continue with fingerprint or face"}
        </span>
      </button>
      <div className="au-row mt-3 justify-center gap-5">
        <button type="button" onClick={onUseAnother} className="au-link">
          Use another account
        </button>
        <button type="button" onClick={() => forgetPasskeyAccount(account.email)} className="au-link au-link--muted">
          Not you?
        </button>
      </div>
    </div>
  );
}

/** Fingerprint button shown under the form when the typed account has a passkey. */
export function PasskeyButton({ busy, disabled, onClick }: { busy: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <div className="au-strength">
      <button type="button" onClick={onClick} disabled={busy || disabled} data-busy={busy || undefined} className="au-btn au-btn--quiet">
        <span key={busy ? "busy" : "idle"} className="au-btn-label">
          {busy ? <Spinner size={18} /> : <Fingerprint size={22} aria-hidden="true" />}
          {busy ? "Waiting for your fingerprint or face…" : "Sign in with fingerprint or face"}
        </span>
      </button>
      <p className="au-msg justify-center" data-tone="hint">This account has a passkey. No password needed.</p>
    </div>
  );
}
