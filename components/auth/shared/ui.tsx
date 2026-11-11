"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode, Ref } from "react";
import { AlertCircle, ChevronRight, Info } from "lucide-react";
import "./auth.css";

/* Small Apple-style pieces shared by every sign-in screen. */

export function Spinner({ size = 18, className = "" }: { size?: number; className?: string }) {
  // Twelve spokes, like the system activity indicator.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={`au-spin ${className}`}>
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x="11"
          y="1.5"
          width="2"
          height="6"
          rx="1"
          fill="currentColor"
          opacity={0.18 + (i / 12) * 0.82}
          transform={`rotate(${i * 30} 12 12)`}
        />
      ))}
    </svg>
  );
}

export function CheckGlyph({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="au-check">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type HeadIcon = "app" | "success" | ReactNode;

/** App icon (or a symbol in a tinted circle), title and one line of help. */
export function AuthHeader({
  icon = "app",
  title,
  subtitle,
  headingRef,
}: {
  icon?: HeadIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="au-head">
      {icon === "app" ? (
        <Link href="/" className="au-appicon" aria-label="Social Work Consultancy Ltd home">
          <Image src="/favicon.png" alt="" width={120} height={120} priority />
        </Link>
      ) : icon === "success" ? (
        <span className="au-glyph" data-tone="success" aria-hidden="true">
          <CheckGlyph size={30} />
        </span>
      ) : (
        <span className="au-glyph" aria-hidden="true">
          {icon}
        </span>
      )}
      <h1 ref={headingRef} tabIndex={headingRef ? -1 : undefined} className="au-title">
        {title}
      </h1>
      {subtitle && <p className="au-sub">{subtitle}</p>}
    </div>
  );
}

export function AuthAlert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "info" }) {
  return (
    <div
      className="au-alert"
      data-tone={tone}
      role={tone === "error" ? "alert" : undefined}
      aria-live={tone === "error" ? "assertive" : undefined}
    >
      {tone === "error" ? <AlertCircle size={18} aria-hidden="true" /> : <Info size={18} aria-hidden="true" />}
      <div>{children}</div>
    </div>
  );
}

type ButtonProps = ComponentProps<"button"> & {
  busy?: boolean;
  busyLabel?: string;
  variant?: "primary" | "quiet";
};

/** Full-width filled button; while busy it shows a spinner and its busy label. */
export function AuthButton({ busy, busyLabel, variant = "primary", children, className = "", disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || busy}
      data-busy={busy || undefined}
      aria-busy={busy || undefined}
      className={`au-btn ${variant === "quiet" ? "au-btn--quiet" : ""} ${className}`}
    >
      <span key={busy ? "busy" : "idle"} className="au-btn-label">
        {busy ? (
          <>
            <Spinner size={18} />
            {busyLabel ?? children}
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}

export function AuthLinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="au-btn">
      <span className="au-btn-label">{children}</span>
    </Link>
  );
}

/** Tinted text link with Apple's trailing chevron. */
export function ChevronLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="au-link">
      {children}
      <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
    </Link>
  );
}

export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="au-divider" aria-hidden="true">
      {children}
    </div>
  );
}

/** Rounded checkbox whose tick draws itself in. */
export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="au-check-row">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="au-checkbox"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span>{label}</span>
    </label>
  );
}

/** Legal line under a form. */
export function LegalNote({ action }: { action: string }) {
  return (
    <p className="au-legal">
      By {action}, you agree to the <Link href="/terms-of-service">Terms of Service</Link> and{" "}
      <Link href="/privacy-policy">Privacy Policy</Link>.
    </p>
  );
}
