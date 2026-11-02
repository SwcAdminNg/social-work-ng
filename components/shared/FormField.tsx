"use client";

import { useId } from "react";
import { CircleAlert } from "lucide-react";

/**
 * A form field in the Apple manner: the label sits inside the box and
 * floats up to a small caption once the field has focus or a value.
 * Shared by the enquiry forms on the home and service pages.
 */
export default function FormField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  autoComplete,
  inputMode,
  optional = false,
  multiline = false,
  hint,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  optional?: boolean;
  multiline?: boolean;
  hint?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  const box = `peer w-full rounded-2xl bg-[#F5F5F7] dark:bg-white/[0.06] text-[1rem] text-gray-900 dark:text-[#ECF2EE] ring-1 ring-inset outline-none transition-[background-color,box-shadow] duration-200 placeholder-transparent ${
    error
      ? "ring-red-500/70 focus:ring-2 focus:ring-red-500"
      : "ring-transparent hover:ring-black/10 dark:hover:ring-white/15 focus:bg-white dark:focus:bg-[#0F1A14] focus:ring-2 focus:ring-[#2D6A4F]"
  }`;
  const floating =
    "pointer-events-none absolute left-4 text-gray-500 dark:text-[#A3B3A9] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[0.72rem] peer-focus:font-semibold peer-focus:tracking-wide peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[0.72rem] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:tracking-wide";

  const labelText = (
    <>
      {label}
      {optional && (
        <span className="text-gray-400 dark:text-[#A3B3A9]/70"> · optional</span>
      )}
    </>
  );

  return (
    <div>
      <div className="relative">
        {multiline ? (
          <textarea
            id={id}
            name={name}
            rows={5}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={label}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-required={!optional}
            className={`${box} min-h-[10rem] px-4 pt-7 pb-3 resize-y leading-relaxed`}
          />
        ) : (
          <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={label}
            autoComplete={autoComplete}
            inputMode={inputMode}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-required={!optional}
            className={`${box} h-14 px-4 pt-5 pb-1`}
          />
        )}
        <label
          htmlFor={id}
          className={`${floating} ${
            multiline ? "top-5 text-[1rem]" : "top-1/2 -translate-y-1/2 text-[1rem]"
          }`}
        >
          {labelText}
        </label>
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-[0.8rem] leading-snug text-red-600 dark:text-red-400"
        >
          <CircleAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p
          id={hintId}
          className="mt-2 text-[0.8rem] leading-snug text-gray-500 dark:text-[#A3B3A9]"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
