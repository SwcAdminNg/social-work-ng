"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/** A value with a small Copy control that confirms itself, as in Apple's order details. */
export function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the value is still selectable.
    }
  };
  return (
    <button type="button" onClick={copy} className="lms-order-copy" aria-label={copied ? `${label} copied` : `Copy ${label}`}>
      <span className="lms-order-mono">{value}</span>
      <span key={copied ? "y" : "n"} className="lms-order-copy-icon" aria-hidden="true">
        {copied ? <Check size={14} strokeWidth={2.6} /> : <Copy size={14} />}
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
