"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { ChoiceGroup, FormAlert, FormNote, FormSuccess, RequiredNote, SelectField, SpamTrap, SubmitButton, TextArea, TextField } from "@/components/site/form";

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

  const sending = status === "sending";
  const errorList = fields.filter((f) => errors[f.name]);

  if (status === "sent") {
    return (
      <FormSuccess
        ref={successRef}
        title={config.success.title}
        body={config.success.body}
        reference={reference}
        againLabel="Send another enquiry"
        onAgain={() => setStatus("idle")}
      />
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
    const value = values[field.name] ?? "";
    const shared = {
      id: fid,
      name: field.name,
      required: field.required,
      optional: !field.required,
      error: errors[field.name],
      hint: field.hint,
      disabled: sending,
    };

    if (field.kind === "radio" || field.kind === "checkboxes") {
      return (
        <ChoiceGroup
          key={field.name}
          {...shared}
          legend={field.label}
          type={field.kind === "radio" ? "radio" : "checkbox"}
          options={field.options.map((option) => ({ value: option, label: option }))}
          value={field.kind === "radio" ? (value ? [value] : []) : value.split("\n").filter(Boolean)}
          onToggle={(option) => (field.kind === "radio" ? update(field.name, option) : toggleCheckbox(field.name, option))}
        />
      );
    }

    if (field.kind === "select") {
      return (
        <SelectField
          key={field.name}
          {...shared}
          label={field.label}
          options={field.options.map((option) => ({ value: option, label: option }))}
          value={value}
          onChange={(next) => update(field.name, next)}
          onBlur={() => onBlur(field)}
        />
      );
    }

    if (field.kind === "textarea") {
      const guidanceId = field.guidance ? `${fid}-guidance` : undefined;
      return (
        <div key={field.name} className="grid gap-3">
          {field.guidance && (
            <FormNote id={guidanceId} icon={<Info size={18} aria-hidden="true" />}>
              {field.guidance}
            </FormNote>
          )}
          <TextArea
            ref={field.name === config.messageField ? messageRef : undefined}
            {...shared}
            label={field.label}
            rows={field.rows}
            maxLength={field.max}
            placeholder={field.placeholder}
            describedBy={guidanceId}
            value={value}
            onChange={(next) => update(field.name, next)}
            onBlur={() => onBlur(field)}
          />
        </div>
      );
    }

    return (
      <TextField
        key={field.name}
        {...shared}
        label={field.label}
        type={field.kind}
        autoComplete={field.autoComplete}
        valid={Boolean(value.trim()) && !validateField(field, value)}
        value={value}
        onChange={(next) => update(field.name, next)}
        onBlur={() => onBlur(field)}
      >
        {field.suggestFrom === "timeZone" && deviceTimeZone && value !== deviceTimeZone && (
          <button type="button" className="swf-inline-action" onClick={() => update(field.name, deviceTimeZone)} disabled={sending}>
            Use {deviceTimeZone}
          </button>
        )}
      </TextField>
    );
  };

  return (
    <form ref={formRef} className="swf-form" onSubmit={onSubmit} noValidate>
      {config.intro}
      <RequiredNote />

      {errorList.length > 0 && (
        <FormAlert
          ref={summaryRef}
          titleId={id("summary")}
          title={`Please check ${errorList.length === 1 ? "this field" : `these ${errorList.length} fields`}`}
        >
          <ul>
            {errorList.map((f) => (
              <li key={f.name}>
                <a href={`#${id(f.name)}`}>{f.label}</a>: {errors[f.name]}
              </li>
            ))}
          </ul>
        </FormAlert>
      )}

      {(status === "failed" || status === "limited") && (
        <FormAlert
          ref={alertRef}
          title={status === "limited" ? "You have sent several enquiries in a short time." : "We could not send your enquiry."}
        >
          <p>
            {status === "limited" ? "Please wait a few minutes and try again" : "Please try again"}, or email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Your answers are still below.
          </p>
        </FormAlert>
      )}

      {rows.map((row) =>
        row.length === 2 ? (
          <div key={row[0].name} className="swf-row">
            {row.map(renderField)}
          </div>
        ) : (
          renderField(row[0])
        ),
      )}

      <SpamTrap />

      <div className="swf-foot">
        <p>
          We use these details only to respond to your enquiry. Read our <Link href="/privacy-policy">Privacy Policy</Link>.
        </p>
        <SubmitButton sending={sending}>{config.submitLabel}</SubmitButton>
        <p className="text-center" role="status" aria-live="polite">
          {sending ? "Sending your enquiry, please wait." : "We will contact you at the email address you provide."}
        </p>
      </div>
    </form>
  );
}
