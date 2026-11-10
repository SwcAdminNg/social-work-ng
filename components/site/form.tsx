"use client";

import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import { AlertCircle, Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import {
  DEFAULT_COUNTRY,
  countryName,
  dialCode,
  formatInternational,
  listCountries,
  readPhone,
  readStoredPhone,
  type CountryCode,
  type PhoneReading,
} from "@/lib/phone";
import { OptionPicker, type PickerOption } from "./Sheet";

/**
 * The form controls used by every public form. Each one draws the same
 * shell: a soft filled field whose label lifts out of the way, with hint and
 * error text wired up for screen readers. Styles live under ".swf" in
 * app/globals.css.
 */

const join = (...ids: (string | false | null | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;

const noopSubscribe = () => () => {};
/** False while server rendering and hydrating, true afterwards. */
function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

type Shared = {
  id: string;
  label: string;
  required?: boolean;
  /** Mark the label "(optional)". */
  optional?: boolean;
  error?: string;
  hint?: ReactNode;
  disabled?: boolean;
  /** Ids of other text that describes the field. */
  describedBy?: string;
};

function LabelText({ label, required, optional }: Pick<Shared, "label" | "required" | "optional">) {
  return (
    <>
      {label}
      {required && <span className="swf-req" aria-hidden="true">*</span>}
      {optional && <span className="swf-opt"> (optional)</span>}
    </>
  );
}

function Below({ id, error, hint, children }: { id: string; error?: string; hint?: ReactNode; children?: ReactNode }) {
  return (
    <>
      {hint && !error && <p id={`${id}-hint`} className="swf-hint">{hint}</p>}
      {children}
      {error && (
        <p id={`${id}-error`} className="swf-error">
          <AlertCircle size={15} aria-hidden="true" />
          {error}
        </p>
      )}
    </>
  );
}

/* ── Single-line field ── */

type TextFieldProps = Shared & {
  name?: string;
  type?: "text" | "email" | "tel" | "url" | "search";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  icon?: ReactNode;
  autoComplete?: string;
  maxLength?: number;
  /** Shows a tick once the value is good. */
  valid?: boolean;
  /** Extra control under the field, such as a one-tap suggestion. */
  children?: ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, name, label, type = "text", value, onChange, onBlur, icon, autoComplete, maxLength, valid, required, optional, error, hint, disabled, describedBy, children },
  ref,
) {
  const status = error ? "invalid" : valid ? "valid" : undefined;
  return (
    <div className="swf" data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      <div className="swf-shell" data-icon={icon ? "" : undefined} data-status={status ? "" : undefined}>
        {icon && <span className="swf-icon" aria-hidden="true">{icon}</span>}
        <input
          ref={ref}
          id={id}
          name={name}
          type={type}
          inputMode={type === "email" ? "email" : type === "tel" ? "tel" : undefined}
          className="swf-input"
          placeholder=" "
          value={value}
          autoComplete={autoComplete}
          autoCapitalize={type === "email" ? "none" : undefined}
          spellCheck={type === "email" ? false : undefined}
          maxLength={maxLength}
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={join(Boolean(hint) && !error && `${id}-hint`, describedBy, error && `${id}-error`)}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
        <label htmlFor={id} className="swf-label">
          <LabelText label={label} required={required} optional={optional} />
        </label>
        {status && (
          <span key={status} className="swf-status" data-kind={status} aria-hidden="true">
            {status === "valid" ? <Check size={14} strokeWidth={3} /> : <AlertCircle size={15} />}
          </span>
        )}
      </div>
      <Below id={id} error={error} hint={hint}>{children}</Below>
    </div>
  );
});

/* ── Long text ── */

type TextAreaProps = Shared & {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength: number;
  /** Starting height in rows of text. */
  rows?: number;
};

const RING = 2 * Math.PI * 8;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { id, name, label, value, onChange, onBlur, placeholder, maxLength, rows, required, optional, error, hint, disabled, describedBy },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const used = Math.min(1, value.length / maxLength);

  // Grow with the text where the browser cannot size the field by itself.
  useEffect(() => {
    const el = innerRef.current;
    if (!el || CSS.supports("field-sizing", "content")) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="swf" data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      <div className="swf-shell swf-shell--area">
        <textarea
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={id}
          name={name}
          className="swf-input swf-textarea"
          style={rows ? { minHeight: `${rows * 1.5 + 2.6}rem` } : undefined}
          placeholder={placeholder || " "}
          value={value}
          maxLength={maxLength}
          required={required}
          aria-required={required || undefined}
          aria-invalid={!!error || undefined}
          aria-describedby={join(Boolean(hint) && !error && `${id}-hint`, describedBy, error && `${id}-error`)}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
        <label htmlFor={id} className="swf-label">
          <LabelText label={label} required={required} optional={optional} />
        </label>
        <div className="swf-area-foot" data-near={used > 0.9 ? "" : undefined} aria-hidden="true">
          <span>
            {value.length}/{maxLength}
          </span>
          <svg className="swf-ring" width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" />
            <circle cx="10" cy="10" r="8" strokeDasharray={RING} strokeDashoffset={RING * (1 - used)} />
          </svg>
        </div>
      </div>
      <Below id={id} error={error} hint={hint} />
    </div>
  );
});

/* ── Select ── */

export type Option = { value: string; label: string; description?: string };

type SelectFieldProps = Shared & {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Option[];
  /** Shown while nothing is chosen. */
  placeholder?: string;
  /** A choosable first entry that stands for "no value", such as "All topics". */
  emptyLabel?: string;
  /** A shorter, pill-shaped field for filter bars; it fills in while a value is chosen. */
  compact?: boolean;
  /** Heading of the chooser; defaults to the label. */
  sheetTitle?: string;
  sheetDescription?: string;
};

/**
 * A select that opens a chooser: a dialog in the middle of the screen on
 * wide screens, a sheet that rises from the bottom on phones.
 */
export function SelectField({
  id, name, label, value, onChange, onBlur, options, placeholder = "Choose one", emptyLabel, compact, sheetTitle, sheetDescription, required, optional, error, hint, disabled, describedBy,
}: SelectFieldProps) {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const shell = `swf-shell${compact ? " swf-shell--compact" : ""}`;
  const described = join(Boolean(hint) && !error && `${id}-hint`, describedBy, error && `${id}-error`);
  const chosen = options.find((option) => option.value === value);
  const labelEl = (
    <label htmlFor={id} className="swf-label">
      <LabelText label={label} required={required} optional={optional} />
    </label>
  );
  const chevron = (
    <span className="swf-chevron" aria-hidden="true">
      <ChevronDown size={17} />
    </span>
  );

  return (
    <div className="swf" data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      {hydrated ? (
        <>
          <div className={shell} data-lifted="" data-open={open ? "" : undefined} data-active={compact && value ? "" : undefined}>
            <button
              type="button"
              id={id}
              className="swf-input swf-select"
              data-placeholder={!chosen && !emptyLabel ? "" : undefined}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-describedby={described}
              disabled={disabled}
              onClick={() => setOpen(true)}
            >
              <span>{chosen?.label ?? emptyLabel ?? placeholder}</span>
            </button>
            {labelEl}
            {chevron}
          </div>
          {name && <input type="hidden" name={name} value={value} />}
          <OptionPicker
            open={open}
            onOpenChange={(next) => {
              setOpen(next);
              if (!next) onBlur?.();
            }}
            title={sheetTitle ?? label}
            description={sheetDescription}
            options={[...(emptyLabel ? [{ value: "", label: emptyLabel }] : []), ...options]}
            value={value}
            onSelect={onChange}
          />
        </>
      ) : (
        // Before the page is interactive (or without JavaScript) a native select does the job.
        <div className={shell} data-lifted="">
          <select
            id={id}
            name={name}
            className="swf-input swf-select"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-required={required || undefined}
            aria-invalid={!!error || undefined}
            aria-describedby={described}
            disabled={disabled}
          >
            <option value="">{emptyLabel ?? placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {labelEl}
          {chevron}
        </div>
      )}
      <Below id={id} error={error} hint={hint} />
    </div>
  );
}

/* ── Phone number ── */

type PhoneFieldProps = Shared & {
  name?: string;
  /** The number in international form, such as "+2348034471063". */
  value: string;
  /** Always called with the international form, or "" when the field is empty. */
  onChange: (e164: string) => void;
  onBlur?: () => void;
  defaultCountry?: CountryCode;
};

function Flag({ country, className }: { country: CountryCode; className?: string }) {
  return (
    <Image
      src={`/images/flags/${country.toLowerCase()}.svg`}
      alt=""
      width={30}
      height={20}
      unoptimized
      className={className ?? "swf-flag"}
    />
  );
}

const digitsBefore = (text: string, caret: number) => text.slice(0, caret).replace(/\D/g, "").length;

/**
 * A phone number field that understands however the number arrives. Type
 * it the local way ("0803 447 1063"), with the country code ("234 803…",
 * "+234…", "00234…") or paste it in any of those shapes: the country
 * switches to match and the form always receives "+2348034471063".
 */
export const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps>(function PhoneField(
  { id, name, label, value, onChange, onBlur, defaultCountry = DEFAULT_COUNTRY, required, optional, error, hint, disabled, describedBy },
  ref,
) {
  const [reading, setReading] = useState<PhoneReading>(() => readStoredPhone(value, defaultCountry));
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const caret = useRef<number | null>(null);

  // The form changed the value itself (a reset, a prefill): read it afresh.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (value !== reading.e164) setReading(readStoredPhone(value, reading.country));
  }

  const apply = (next: PhoneReading) => {
    setReading(next);
    setLastValue(next.e164);
    if (next.e164 !== value) onChange(next.e164);
  };

  const onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const el = event.target;
    const next = readPhone(el.value, reading.country);
    // Put the caret back after the same digit it was after before the tidy-up.
    const typedBefore = digitsBefore(el.value, el.selectionStart ?? el.value.length);
    const dropped = el.value.replace(/\D/g, "").length - next.display.replace(/\D/g, "").length;
    let seen = 0;
    let position = next.display.length;
    const target = Math.max(0, typedBefore - Math.max(0, dropped));
    for (let i = 0; i < next.display.length && target > 0; i++) {
      if (/\d/.test(next.display[i]) && ++seen === target) {
        position = i + 1;
        break;
      }
    }
    caret.current = target === 0 ? 0 : position;
    apply(next);
  };

  // A whole number pasted in replaces what is there, whatever shape it is in.
  const onPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");
    const digits = pasted.replace(/\D/g, "");
    if (digits.length < 7 && !/^\s*(\+|00)/.test(pasted)) return;
    event.preventDefault();
    caret.current = null;
    let next = readPhone(pasted, reading.country);
    // A local number that does not fit the chosen country may be one from the
    // default country, pasted after another country was picked.
    if (!next.valid && reading.country !== defaultCountry) {
      const local = readPhone(pasted, defaultCountry);
      if (local.valid) next = local;
    }
    apply(next);
  };

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (el && caret.current !== null && document.activeElement === el) {
      el.setSelectionRange(caret.current, caret.current);
    }
    caret.current = null;
  }, [reading.display]);

  const pickCountry = (code: string) => {
    const country = code as CountryCode;
    // Keep the digits already typed and read them for the new country.
    const digits = reading.display.replace(/\D/g, "");
    apply(digits ? readPhone(digits, country) : { country, display: "", e164: "", valid: false });
    window.setTimeout(() => inputRef.current?.focus(), 60);
  };

  const countries = useMemo<PickerOption[]>(
    () =>
      listCountries().map((entry) => ({
        value: entry.code,
        label: entry.name,
        trailing: entry.dial,
        keywords: entry.code,
        leading: <Flag country={entry.code} className="swm-flag" />,
      })),
    [],
  );

  const hasDigits = /\d/.test(reading.display);
  const status = error ? "invalid" : reading.valid ? "valid" : undefined;
  const preview = reading.valid && !error ? `${formatInternational(reading.e164)} · ${countryName(reading.country)}` : null;

  return (
    <div className="swf" data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
      <div className="swf-shell swf-shell--phone" data-status={status ? "" : undefined}>
        <button
          type="button"
          className="swf-country"
          onClick={() => setPickerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          aria-label={`Country code: ${countryName(reading.country)}, ${dialCode(reading.country)}. Change country`}
          disabled={disabled}
        >
          <Flag country={reading.country} />
          <span className="swf-dial">{dialCode(reading.country)}</span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
        <div className="swf-phone-main">
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            id={id}
            type="tel"
            inputMode="tel"
            className="swf-input"
            placeholder=" "
            value={reading.display}
            autoComplete="tel"
            required={required}
            aria-required={required || undefined}
            aria-invalid={!!error || undefined}
            aria-describedby={join((preview || (Boolean(hint) && !error)) && `${id}-hint`, describedBy, error && `${id}-error`)}
            disabled={disabled}
            onChange={onInput}
            onPaste={onPaste}
            onBlur={onBlur}
          />
          <label htmlFor={id} className="swf-label">
            <LabelText label={label} required={required} optional={optional} />
          </label>
          {status && (
            <span key={status} className="swf-status" data-kind={status} aria-hidden="true">
              {status === "valid" ? <Check size={14} strokeWidth={3} /> : <AlertCircle size={15} />}
            </span>
          )}
        </div>
      </div>
      {name && <input type="hidden" name={name} value={reading.e164} />}
      <Below id={id} error={error} hint={preview ? <span className="swf-phone-preview">{preview}</span> : hasDigits ? null : hint} />
      <OptionPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        eyebrow="Country code"
        title="Where is this number from?"
        options={countries}
        value={reading.country}
        onSelect={pickCountry}
        searchPlaceholder="Search by country or code"
        searchable
      />
    </div>
  );
});

/* ── Search ── */

/**
 * A search box for the top of a list. It sits inside a form and submits
 * with it; "/" jumps to it from anywhere on the page.
 */
export function SearchBar({
  id,
  name = "search",
  label,
  placeholder,
  defaultValue = "",
}: {
  id: string;
  name?: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="swf-search">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className="swf-search-icon" aria-hidden="true">
        <Search size={19} />
      </span>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        inputMode="search"
        className="swf-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoComplete="off"
        enterKeyHint="search"
      />
      {value ? (
        <button
          type="button"
          className="swf-search-clear"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            // Submit the cleared search once the empty value is in the form.
            const form = inputRef.current?.form;
            window.setTimeout(() => (defaultValue ? form?.requestSubmit() : inputRef.current?.focus()), 0);
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : (
        <kbd className="swf-search-key" aria-hidden="true">/</kbd>
      )}
      <button type="submit" className="sw-btn swf-search-go">
        <span>Search</span>
        <span className="sw-btn-dot" aria-hidden="true">
          <SendArrow />
          <SendArrow />
        </span>
      </button>
    </div>
  );
}

/* ── One or several choices, as pills ── */

type ChoiceGroupProps = Omit<Shared, "label"> & {
  name: string;
  legend: string;
  /** "radio" picks one; "checkbox" picks any number. */
  type?: "radio" | "checkbox";
  options: Option[];
  /** The chosen values. */
  value: string[];
  onToggle: (value: string) => void;
};

export function ChoiceGroup({
  id, name, legend, type = "radio", options, value, onToggle, required, optional, error, hint, disabled, describedBy,
}: ChoiceGroupProps) {
  return (
    <fieldset
      className="swf-fieldset"
      aria-required={type === "radio" ? required || undefined : undefined}
      aria-invalid={!!error || undefined}
      aria-describedby={join(Boolean(hint) && !error && `${id}-hint`, describedBy, error && `${id}-error`)}
      disabled={disabled}
    >
      <legend className="swf-legend">
        <LabelText label={legend} required={required} optional={optional} />
      </legend>
      {/* Focusable by script so the error summary can jump here. */}
      <div id={id} tabIndex={-1} className="swf-chips" data-invalid={error ? "" : undefined}>
        {options.map((option) => (
          <label key={option.value} className="swf-chip">
            <input
              type={type}
              name={name}
              value={option.value}
              checked={value.includes(option.value)}
              onChange={() => onToggle(option.value)}
            />
            <span className="swf-chip-face">
              <span className="swf-chip-mark" aria-hidden="true">
                <Check size={13} strokeWidth={3} />
              </span>
              {option.label}
            </span>
          </label>
        ))}
      </div>
      <div className="mt-2.5 grid gap-2 empty:hidden">
        <Below id={id} error={error} hint={hint} />
      </div>
    </fieldset>
  );
}

/* ── Supporting pieces ── */

export function FormNote({ id, icon, children }: { id?: string; icon: ReactNode; children: ReactNode }) {
  return (
    <p id={id} className="swf-note">
      {icon}
      <span>{children}</span>
    </p>
  );
}

export const FormAlert = forwardRef<HTMLDivElement, { title: ReactNode; titleId?: string; children?: ReactNode }>(
  function FormAlert({ title, titleId, children }, ref) {
    return (
      <div ref={ref} tabIndex={-1} className="swf-alert" role="alert" aria-labelledby={titleId}>
        <AlertCircle size={20} aria-hidden="true" />
        <div>
          <h3 id={titleId}>{title}</h3>
          {children}
        </div>
      </div>
    );
  },
);

export function RequiredNote({ id }: { id?: string }) {
  return (
    <p id={id} className="swf-hint">
      Fields marked <span className="swf-req" aria-hidden="true">*</span>
      <span className="sr-only">with an asterisk</span> are required.
    </p>
  );
}

/** Spam trap: real visitors never see or fill this. */
export function SpamTrap() {
  return (
    <div className="swf-trap" aria-hidden="true">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function SubmitButton({ sending, sendingLabel = "Sending…", children }: { sending: boolean; sendingLabel?: string; children: ReactNode }) {
  return (
    <button type="submit" className="sw-btn swf-submit" disabled={sending} aria-disabled={sending}>
      <span>{sending ? sendingLabel : children}</span>
      <span className="sw-btn-dot" aria-hidden="true">
        {sending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            <SendArrow />
            <SendArrow />
          </>
        )}
      </span>
    </button>
  );
}

function SendArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export const FormSuccess = forwardRef<HTMLHeadingElement, { title: string; body: string; reference?: string | null; againLabel: string; onAgain: () => void }>(
  function FormSuccess({ title, body, reference, againLabel, onAgain }, ref) {
    return (
      <div className="swf-success" role="status">
        <span className="swf-success-mark" aria-hidden="true">
          <Check size={34} strokeWidth={2.5} />
        </span>
        <h3 ref={ref} tabIndex={-1} className="sw-display m-0 max-w-[18ch] text-[clamp(1.6rem,3vw,2.2rem)] text-ink outline-none">
          {title}
        </h3>
        <p>{body}</p>
        {reference && (
          <p className="swf-ref">
            Reference: <strong>{reference}</strong>
          </p>
        )}
        <button type="button" className="sw-btn sw-btn--ghost mt-2 text-ink" onClick={onAgain}>
          <span>{againLabel}</span>
          <span className="sw-btn-dot" aria-hidden="true">
            <SendArrow />
            <SendArrow />
          </span>
        </button>
      </div>
    );
  },
);
