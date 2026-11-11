"use client";

import { forwardRef, useState } from "react";
import { AlertCircle, ArrowBigUp } from "lucide-react";
import "./auth.css";

type Props = {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  /** Kept for older callers; Apple-style fields carry no leading icon. */
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  /** "wide" leaves room for two controls at the end of the field. */
  suffixSize?: "normal" | "wide";
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  required?: boolean;
  error?: string;
  /** Show the error text elsewhere (for joined fields); the field still turns red. */
  errorId?: string;
  /** Short help shown under the field and read with it. */
  hint?: React.ReactNode;
  /** Extra content under the field (e.g. a password checklist); linked for screen readers. */
  describedById?: string;
  /** Show a Caps Lock warning while typing (password fields). */
  capsLockWarning?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
};

/** A hairline field whose label floats up out of the way, as on Apple's sign-in. */
export const FloatingInput = forwardRef<HTMLInputElement, Props>(function FloatingInput(
  {
    id,
    label,
    type,
    value,
    onChange,
    suffix,
    suffixSize = "normal",
    autoComplete,
    inputMode,
    required,
    error,
    errorId: externalErrorId,
    hint,
    describedById,
    capsLockWarning,
    maxLength,
    autoFocus,
  },
  ref,
) {
  const [capsOn, setCapsOn] = useState(false);
  const errorId = error ? externalErrorId ?? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const capsId = capsLockWarning && capsOn ? `${id}-caps` : undefined;
  const describedBy = [errorId, hintId, capsId, describedById].filter(Boolean).join(" ") || undefined;

  const trackCaps = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (capsLockWarning) setCapsOn(event.getModifierState?.("CapsLock") ?? false);
  };

  return (
    <div className="au-field" data-invalid={error ? "" : undefined}>
      <div className="au-control" data-suffix={suffix ? suffixSize : undefined}>
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
          autoFocus={autoFocus}
          aria-required={required || undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={describedBy}
          maxLength={maxLength}
          autoCapitalize={type === "email" || autoComplete?.startsWith("username") ? "none" : undefined}
          autoCorrect={type === "email" || autoComplete?.startsWith("username") ? "off" : undefined}
          spellCheck={type === "email" || type === "password" || autoComplete?.startsWith("username") ? false : undefined}
          onBlur={() => setCapsOn(false)}
          onKeyDown={trackCaps}
          onKeyUp={trackCaps}
          onChange={(e) => onChange(e.target.value)}
          placeholder=" "
          className="au-input"
        />
        <label htmlFor={id} className="au-label">
          {label}
        </label>
        {suffix && <span className="au-suffix">{suffix}</span>}
      </div>

      {error && !externalErrorId && (
        <p id={errorId} className="au-msg" data-tone="error">
          <AlertCircle size={15} aria-hidden="true" />
          {error}
        </p>
      )}
      {capsId && (
        <p id={capsId} className="au-msg" data-tone="warn" aria-live="polite">
          <ArrowBigUp size={15} aria-hidden="true" /> Caps Lock is on
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="au-msg" data-tone="hint">
          {hint}
        </p>
      )}
    </div>
  );
});

/** Error lines for joined fields, shown once under the whole group. */
export function FieldErrors({ errors }: { errors: { id: string; text?: string }[] }) {
  const shown = errors.filter((e) => e.text);
  if (!shown.length) return null;
  return (
    <div className="au-msgs">
      {shown.map((e) => (
        <p key={e.id} id={e.id} className="au-msg" data-tone="error">
          <AlertCircle size={15} aria-hidden="true" />
          {e.text}
        </p>
      ))}
    </div>
  );
}
