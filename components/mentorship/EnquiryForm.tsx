"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertCircle, Check, CheckCircle2, Info, Loader2, Send } from "lucide-react";
// Form controls share the Contact page's styles so every enquiry form looks the same.
import s from "@/components/contact/Contact.module.css";

const SUPPORT_EMAIL = "support@socialworknigeria.org";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Base = { name: string; label: string; required?: boolean; hint?: string; half?: boolean };
export type FieldDef =
  | (Base & {
      kind: "text" | "email" | "tel";
      autoComplete?: string;
      max?: number;
      /** Offer the device's value (e.g. its time zone) as a one-tap suggestion. */
      suggestFrom?: "timeZone";
    })
  | (Base & { kind: "select"; options: string[] })
  | (Base & { kind: "radio"; options: string[] })
  | (Base & { kind: "checkboxes"; options: string[] })
  | (Base & { kind: "textarea"; max: number; min?: number; placeholder?: string; guidance?: string; rows?: number });

export type FormConfig = {
  /** Fields with these names map to the API's own columns; all others are sent as labelled details. */
  fields: FieldDef[];
  messageField: string;
  category: string;
  subject: (values: Record<string, string>) => string;
  sourcePage: string;
  submitLabel: string;
  intro?: React.ReactNode;
  success: { title: string; body: string };
  /** Event other parts of the page dispatch ({ field, value }) to pre-fill a choice. */
  prefillEvent?: string;
};

type Values = Record<string, string>;
type Errors = Record<string, string | undefined>;
type Status = "idle" | "sending" | "failed" | "limited" | "sent";

const CORE: Record<string, string> = { fullName: "full_name", email: "email", phone: "phone_number" };

const noopSubscribe = () => () => {};
/** The device's time zone in the browser; empty during server rendering. */
function useDeviceTimeZone() {
  return useSyncExternalStore(
    noopSubscribe,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    () => "",
  );
}

function initialValues(fields: FieldDef[]): Values {
  return Object.fromEntries(fields.map((f) => [f.name, ""]));
}

function validateField(field: FieldDef, raw: string): string | undefined {
  const value = raw.trim();
  const lower = field.label.toLowerCase();
  if (!value) {
    if (!field.required) return undefined;
    if (field.kind === "radio" || field.kind === "select") return `Choose your ${lower}.`;
    if (field.kind === "checkboxes") return "Choose at least one option.";
    return `Enter your ${lower}.`;
  }
  if (field.kind === "email" && !EMAIL_PATTERN.test(value)) return "Enter a valid email address so we can reply.";
  if (field.kind === "tel") {
    const digits = value.replace(/\D/g, "");
    if (!/^\+?[\d\s().-]+$/.test(value) || digits.length < 7 || digits.length > 15) {
      return "Enter a phone number with country code, for example +234 803 447 1063, or leave it blank.";
    }
  }
  if (field.kind === "textarea") {
    if (field.min && value.length < field.min) return `Add a little more detail (at least ${field.min} characters).`;
    if (value.length > field.max) return `Keep this under ${field.max} characters.`;
  }
  if ((field.kind === "text" || field.kind === "email") && field.max && value.length > field.max) {
    return `Keep this under ${field.max} characters.`;
  }
  return undefined;
}

export default function EnquiryForm({ config }: { config: FormConfig }) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const { fields } = config;

  const [values, setValues] = useState<Values>(() => initialValues(fields));
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [reference, setReference] = useState<string | null>(null);
  const [summaryFocus, setSummaryFocus] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const deviceTimeZone = useDeviceTimeZone();

  useEffect(() => {
    if (!config.prefillEvent) return;
    const onPrefill = (event: Event) => {
      const { field, value } = (event as CustomEvent<{ field: string; value: string }>).detail ?? {};
      if (!fields.some((f) => f.name === field)) return;
      setStatus((current) => (current === "sent" ? "idle" : current));
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      formRef.current?.closest("section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => messageRef.current?.focus({ preventScroll: true }), 500);
    };
    window.addEventListener(config.prefillEvent, onPrefill);
    return () => window.removeEventListener(config.prefillEvent!, onPrefill);
  }, [config.prefillEvent, fields]);

  useEffect(() => {
    if (summaryFocus) summaryRef.current?.focus();
  }, [summaryFocus]);
  useEffect(() => {
    if (status === "sent") successRef.current?.focus();
    if (status === "failed" || status === "limited") alertRef.current?.focus();
  }, [status]);

  const validateAll = (vals: Values) =>
    Object.fromEntries(fields.map((f) => [f.name, validateField(f, vals[f.name] ?? "")]).filter(([, e]) => e));

  const update = (name: string, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (tried) {
      const field = fields.find((f) => f.name === name)!;
      setErrors((current) => ({ ...current, [name]: validateField(field, value) }));
    }
  };

  const onBlur = (field: FieldDef) => {
    if (!tried && !values[field.name]) return;
    setErrors((current) => ({ ...current, [field.name]: validateField(field, values[field.name] ?? "") }));
  };

  const toggleCheckbox = (name: string, option: string) => {
    const current = (values[name] ?? "").split("\n").filter(Boolean);
    const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
    update(name, next.join("\n"));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    setTried(true);
    const found = validateAll(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus("idle");
      setSummaryFocus((n) => n + 1);
      return;
    }
    if (new FormData(event.currentTarget).get("website")) {
      setStatus("sent"); // Only automated submissions fill the hidden field.
      return;
    }

    setStatus("sending");
    const details = fields
      .filter((f) => !CORE[f.name] && f.name !== config.messageField)
      .map((f) => ({ label: f.label, value: (values[f.name] ?? "").split("\n").filter(Boolean).join(", ").trim() }))
      .filter((d) => d.value);

    try {
      const res = await fetch("/api/proxy/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.fullName.trim(),
          email: values.email.trim(),
          phone_number: values.phone?.trim() || undefined,
          message: values[config.messageField].trim(),
          subject: config.subject(values),
          category: config.category,
          platform: "NG",
          source_page: config.sourcePage,
          details: details.length ? details : undefined,
        }),
      });
      if (res.status === 429) {
        setStatus("limited");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json().catch(() => ({}));
      setReference(data?.data?.reference ? String(data.data.reference) : null);
      setValues(initialValues(fields));
      setErrors({});
      setTried(false);
      setStatus("sent");
    } catch {
      setStatus("failed"); // Answers are kept so the visitor can try again.
    }
  };

  const describedBy = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;
  const sending = status === "sending";
  const errorList = fields.filter((f) => errors[f.name]);

  if (status === "sent") {
    return (
      <div className={s.success} role="status">
        <span className={s.successIcon}>
          <CheckCircle2 size={34} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h3 ref={successRef} tabIndex={-1} style={{ fontSize: "clamp(1.3rem, 1.15rem + 0.6vw, 1.6rem)" }}>
          {config.success.title}
        </h3>
        <p>{config.success.body}</p>
        {reference && (
          <p className={s.reference}>
            Reference: <strong>{reference}</strong>
          </p>
        )}
        <button type="button" className={s.secondaryButton} onClick={() => setStatus("idle")}>
          Send another enquiry
        </button>
      </div>
    );
  }

  // Group consecutive half-width fields into two-column rows.
  const rows: FieldDef[][] = [];
  for (const field of fields) {
    const last = rows[rows.length - 1];
    if (field.half && last && last.length === 1 && last[0].half) last.push(field);
    else rows.push([field]);
  }

  const renderField = (field: FieldDef) => {
    const fid = id(field.name);
    const err = errors[field.name];
    const errId = err ? `${fid}-error` : undefined;
    const hintId = field.hint ? `${fid}-hint` : undefined;
    const label = (
      <>
        {field.label}
        {field.required ? (
          <span className={s.required} aria-hidden="true">*</span>
        ) : (
          <span className={s.optional}> (optional)</span>
        )}
      </>
    );
    const errorEl = err && (
      <span id={errId} className={s.fieldError}>
        <AlertCircle size={15} aria-hidden="true" />
        {err}
      </span>
    );

    if (field.kind === "radio" || field.kind === "checkboxes") {
      const selected = (values[field.name] ?? "").split("\n").filter(Boolean);
      return (
        <fieldset
          key={field.name}
          className={s.fieldset}
          aria-invalid={!!err || undefined}
          aria-describedby={describedBy(hintId, errId)}
          disabled={sending}
        >
          <legend className={s.label}>{label}</legend>
          {field.hint && <p id={hintId} className={s.hint} style={{ marginBottom: 8 }}>{field.hint}</p>}
          <div id={fid} tabIndex={-1} className={`${s.topics} ${err ? s.topicsInvalid : ""}`}>
            {field.options.map((option) => (
              <label key={option} className={s.topic}>
                <input
                  type={field.kind === "radio" ? "radio" : "checkbox"}
                  name={field.name}
                  value={option}
                  checked={field.kind === "radio" ? values[field.name] === option : selected.includes(option)}
                  onChange={() => (field.kind === "radio" ? update(field.name, option) : toggleCheckbox(field.name, option))}
                />
                <span className={s.topicFace}>
                  <Check size={15} strokeWidth={2.5} aria-hidden="true" />
                  {option}
                </span>
              </label>
            ))}
          </div>
          {errorEl && <div style={{ marginTop: 8 }}>{errorEl}</div>}
        </fieldset>
      );
    }

    if (field.kind === "select") {
      return (
        <div key={field.name} className={s.field}>
          <label htmlFor={fid} className={s.label}>{label}</label>
          <select
            id={fid}
            name={field.name}
            className={s.input}
            value={values[field.name]}
            onChange={(e) => update(field.name, e.target.value)}
            onBlur={() => onBlur(field)}
            aria-required={field.required || undefined}
            aria-invalid={!!err || undefined}
            aria-describedby={describedBy(hintId, errId)}
            disabled={sending}
          >
            <option value="">Choose one</option>
            {field.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {field.hint && <span id={hintId} className={s.hint}>{field.hint}</span>}
          {errorEl}
        </div>
      );
    }

    if (field.kind === "textarea") {
      const length = (values[field.name] ?? "").length;
      const guidanceId = field.guidance ? `${fid}-guidance` : undefined;
      return (
        <div key={field.name} className={s.field}>
          <label htmlFor={fid} className={s.label}>{label}</label>
          {field.guidance && (
            <p id={guidanceId} className={s.callout}>
              <Info size={18} aria-hidden="true" />
              <span>{field.guidance}</span>
            </p>
          )}
          <textarea
            ref={field.name === config.messageField ? messageRef : undefined}
            id={fid}
            name={field.name}
            className={s.textarea}
            style={field.rows ? { minHeight: field.rows * 28 } : undefined}
            maxLength={field.max}
            placeholder={field.placeholder}
            value={values[field.name]}
            onChange={(e) => update(field.name, e.target.value)}
            onBlur={() => onBlur(field)}
            aria-required={field.required || undefined}
            aria-invalid={!!err || undefined}
            aria-describedby={describedBy(guidanceId, hintId, errId)}
            disabled={sending}
          />
          <div className={s.messageMeta}>
            {errorEl || (field.hint ? <span id={hintId} className={s.hint}>{field.hint}</span> : <span />)}
            <span className={`${s.counter} ${length > field.max * 0.9 ? s.counterNear : ""}`} aria-hidden="true">
              {length}/{field.max}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div key={field.name} className={s.field}>
        <label htmlFor={fid} className={s.label}>{label}</label>
        <input
          id={fid}
          name={field.name}
          type={field.kind}
          inputMode={field.kind === "email" ? "email" : field.kind === "tel" ? "tel" : undefined}
          className={s.input}
          autoComplete={field.autoComplete}
          autoCapitalize={field.kind === "email" ? "none" : undefined}
          spellCheck={field.kind === "email" ? false : undefined}
          value={values[field.name]}
          onChange={(e) => update(field.name, e.target.value)}
          onBlur={() => onBlur(field)}
          aria-required={field.required || undefined}
          aria-invalid={!!err || undefined}
          aria-describedby={describedBy(hintId, errId)}
          disabled={sending}
        />
        {field.hint && <span id={hintId} className={s.hint}>{field.hint}</span>}
        {field.suggestFrom === "timeZone" && deviceTimeZone && values[field.name] !== deviceTimeZone && (
          <button
            type="button"
            className={s.hint}
            style={{ justifySelf: "start", padding: "6px 0", border: 0, background: "none", color: "var(--link)", fontWeight: 600, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
            onClick={() => update(field.name, deviceTimeZone)}
            disabled={sending}
          >
            Use {deviceTimeZone}
          </button>
        )}
        {errorEl}
      </div>
    );
  };

  return (
    <form ref={formRef} className={s.form} onSubmit={onSubmit} noValidate>
      {config.intro}
      <p className={s.hint}>
        Fields marked <span className={s.required} aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} className={s.alert} role="alert" aria-labelledby={id("summary")}>
          <AlertCircle size={20} aria-hidden="true" />
          <div>
            <h3 id={id("summary")}>
              Please check {errorList.length === 1 ? "this field" : `these ${errorList.length} fields`}
            </h3>
            <ul>
              {errorList.map((f) => (
                <li key={f.name}>
                  <a href={`#${id(f.name)}`}>{f.label}</a>: {errors[f.name]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(status === "failed" || status === "limited") && (
        <div ref={alertRef} tabIndex={-1} className={s.alert} role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <div>
            <h3>
              {status === "limited"
                ? "You have sent several enquiries in a short time."
                : "We could not send your enquiry."}
            </h3>
            <p>
              {status === "limited" ? "Please wait a few minutes and try again" : "Please try again"}, or email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Your answers are still below.
            </p>
          </div>
        </div>
      )}

      {rows.map((row) =>
        row.length === 2 ? (
          <div key={row[0].name} className={s.row}>
            {row.map(renderField)}
          </div>
        ) : (
          renderField(row[0])
        ),
      )}

      <div className={s.trap} aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={s.submitArea}>
        <p className={s.privacy}>
          We use these details only to respond to your enquiry. Read our{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
        <button type="submit" className={s.submit} disabled={sending}>
          {sending ? (
            <>
              <Loader2 size={18} className={s.spinner} aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              {config.submitLabel} <Send size={17} aria-hidden="true" />
            </>
          )}
        </button>
        <p className={s.replyNote} role="status" aria-live="polite">
          {sending ? "Sending your enquiry, please wait." : "We will contact you at the email address you provide."}
        </p>
      </div>
    </form>
  );
}
