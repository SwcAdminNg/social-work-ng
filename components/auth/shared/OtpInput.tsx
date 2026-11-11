"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "./ui";
import "./auth.css";

export type OtpStatus = "idle" | "verifying" | "error" | "success";

/**
 * State for a code entry: the digits, and what the boxes should show.
 * `fail()` shakes the wrong code for a moment, then clears it for a retry.
 */
export function useOtp() {
  const [code, setCodeRaw] = useState("");
  const [status, setStatus] = useState<OtpStatus>("idle");
  const clearTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
  }, []);

  const setCode = useCallback((value: string) => {
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    setCodeRaw(value);
    setStatus((s) => (s === "error" ? "idle" : s));
  }, []);

  const fail = useCallback(() => {
    setStatus("error");
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => setCodeRaw(""), 650);
  }, []);

  const reset = useCallback(() => {
    if (clearTimer.current) window.clearTimeout(clearTimer.current);
    setCodeRaw("");
    setStatus("idle");
  }, []);

  return {
    code,
    setCode,
    status,
    verifying: () => setStatus("verifying"),
    succeed: () => setStatus("success"),
    fail,
    reset,
  };
}

/**
 * Six boxes in two groups of three, the way Apple shows a verification code.
 * One real input sits over them, so typing, pasting, SMS autofill and the
 * numeric keypad all behave natively; the boxes only draw what it holds.
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled,
  autoFocus,
  status = "idle",
  label = "Verification code",
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  status?: OtpStatus;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back to the boxes after a wrong code, ready for the next try.
  useEffect(() => {
    if (status === "error" || (status === "idle" && !disabled)) {
      if (document.activeElement === document.body) inputRef.current?.focus({ preventScroll: true });
    }
  }, [status, disabled]);

  // Tell the form once each time the code becomes complete.
  const firedFor = useRef<string | null>(null);
  useEffect(() => {
    if (value.length !== length) {
      firedFor.current = null;
    } else if (firedFor.current !== value && status !== "error") {
      firedFor.current = value;
      onComplete?.(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length]);

  const keepCaretAtEnd = () => {
    const el = inputRef.current;
    if (el && (el.selectionStart !== el.value.length || el.selectionEnd !== el.value.length)) {
      el.setSelectionRange(el.value.length, el.value.length);
    }
  };

  const cells = Array.from({ length }, (_, i) => value[i] ?? "");
  const active = Math.min(value.length, length - 1);
  const half = Math.ceil(length / 2);
  const locked = disabled || status === "verifying" || status === "success";

  const cell = (i: number) => (
    <div
      key={i}
      className="au-otp-cell"
      style={{ ["--i" as string]: i }}
      data-filled={cells[i] ? "" : undefined}
      data-active={!locked && i === active && value.length < length ? "" : undefined}
    >
      {cells[i] ? (
        <span key={`${i}-${cells[i]}`} className="au-otp-digit">
          {cells[i]}
        </span>
      ) : focused && !locked && i === active ? (
        <span className="au-otp-caret" aria-hidden="true" />
      ) : null}
    </div>
  );

  return (
    <div>
      <div className="au-otp" data-state={status} data-focused={focused ? "" : undefined}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="one-time-code"
          maxLength={length}
          aria-label={`${label}, ${length} digits`}
          aria-invalid={status === "error" || undefined}
          value={value}
          disabled={locked}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSelect={keepCaretAtEnd}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
          className="au-otp-input"
        />
        <div className="au-otp-cells" aria-hidden="true">
          {cells.slice(0, half).map((_, i) => cell(i))}
          <span className="au-otp-sep" />
          {cells.slice(half).map((_, i) => cell(i + half))}
        </div>
      </div>

      <p className="au-otp-note" aria-live="polite">
        {status === "verifying" && (
          <>
            <Spinner size={15} /> Checking code…
          </>
        )}
        {status === "success" && "Code accepted"}
      </p>
    </div>
  );
}

/** "Resend code" with a small ring that empties while you have to wait. */
export function ResendButton({
  seconds,
  total = 30,
  busy,
  onClick,
}: {
  seconds: number;
  total?: number;
  busy?: boolean;
  onClick: () => void;
}) {
  const r = 7;
  const c = 2 * Math.PI * r;
  const waiting = seconds > 0;
  return (
    <button type="button" className="au-link" disabled={waiting || busy} onClick={onClick}>
      {busy ? (
        <>
          <Spinner size={14} /> <span className="ml-1">Sending…</span>
        </>
      ) : waiting ? (
        <>
          <svg width="18" height="18" viewBox="0 0 18 18" className="au-ring mr-1.5" aria-hidden="true">
            <circle cx="9" cy="9" r={r} />
            <circle cx="9" cy="9" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - seconds / total)} />
          </svg>
          Resend in 0:{String(seconds).padStart(2, "0")}
        </>
      ) : (
        "Resend code"
      )}
    </button>
  );
}

/** A 30-second wait that counts itself down. */
export function useCooldown() {
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);
  const start = useCallback((from = 30) => {
    if (timer.current) window.clearInterval(timer.current);
    setSeconds(from);
    timer.current = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (timer.current) window.clearInterval(timer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);
  return { seconds, start };
}
