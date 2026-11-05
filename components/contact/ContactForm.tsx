"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, Check, CheckCircle2, Info, Loader2, Send, ShieldAlert } from "lucide-react";
import s from "./Contact.module.css";

export const TOPICS = [
  { value: "course", label: "Course Enquiry" },
  { value: "mentorship", label: "Mentorship" },
  { value: "account", label: "Account or Learning Support" },
  { value: "partnership", label: "Partnership or Organisational Enquiry" },
  { value: "other", label: "Other" },
] as const;

export type TopicValue = (typeof TOPICS)[number]["value"];

/** Event other parts of the page dispatch to pre-select a topic. */
export const TOPIC_EVENT = "swcl:contact-topic";

const SUPPORT_EMAIL = "support@socialworknigeria.org";
const MESSAGE_MAX = 2000;
const MESSAGE_MIN = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Values = { fullName: string; email: string; topic: TopicValue | ""; phone: string; message: string };
type Field = keyof Values;
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "failed" | "sent";

const EMPTY: Values = { fullName: "", email: "", topic: "", phone: "", message: "" };

const FIELD_ORDER: Field[] = ["fullName", "email", "topic", "phone", "message"];
const FIELD_LABELS: Record<Field, string> = {
  fullName: "Full name",
  email: "Email address",
  topic: "Enquiry type",
  phone: "Telephone number",
  message: "Message",
};

function validate(values: Values): Errors {
  const errors: Errors = {};
  const name = values.fullName.trim();
  if (!name) errors.fullName = "Enter your full name so we know who to reply to.";
  else if (name.length > 120) errors.fullName = "Keep your name under 120 characters.";

  const email = values.email.trim();
  if (!email) errors.email = "Enter your email address so we can reply.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address so we can reply.";

  if (!values.topic) errors.topic = "Choose the topic that best matches your enquiry.";

  const phone = values.phone.trim();
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
      errors.phone = "Enter a phone number with country code, for example +234 803 447 1063, or leave it blank.";
    }
  }

  const message = values.message.trim();
  if (!message) errors.message = "Tell us what you need help with.";
  else if (message.length < MESSAGE_MIN) errors.message = `Add a little more detail (at least ${MESSAGE_MIN} characters).`;
  else if (message.length > MESSAGE_MAX) errors.message = `Keep your message under ${MESSAGE_MAX} characters.`;

  return errors;
}

function isTopic(value: string | undefined): value is TopicValue {
  return TOPICS.some((topic) => topic.value === value);
}

export default function ContactForm({ initialTopic }: { initialTopic?: string }) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [values, setValues] = useState<Values>({
    ...EMPTY,
    topic: isTopic(initialTopic) ? initialTopic : "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [reference, setReference] = useState<string | null>(null);
  // Bumped on each failed validation so the error summary takes focus once it has rendered.
  const [summaryFocusRequest, setSummaryFocusRequest] = useState(0);

  const summaryRef = useRef<HTMLDivElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Quick links elsewhere on the page can choose a topic for the visitor.
  useEffect(() => {
    const onTopic = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      if (!isTopic(value)) return;
      setStatus((current) => (current === "sent" ? "idle" : current));
      setValues((current) => ({ ...current, topic: value }));
      setErrors((current) => ({ ...current, topic: undefined }));
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => messageRef.current?.focus({ preventScroll: true }), 450);
    };
    window.addEventListener(TOPIC_EVENT, onTopic);
    return () => window.removeEventListener(TOPIC_EVENT, onTopic);
  }, []);

  useEffect(() => {
    if (summaryFocusRequest) summaryRef.current?.focus();
  }, [summaryFocusRequest]);

  useEffect(() => {
    if (status === "sent") successRef.current?.focus();
    if (status === "failed") failureRef.current?.focus();
  }, [status]);

  const update = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // After a first attempt, errors clear (or update) as the visitor types.
    if (triedSubmit) setErrors((current) => ({ ...current, [field]: validate(next)[field] }));
  };

  const revalidateOnBlur = (field: Field) => {
    if (!triedSubmit && !values[field]) return;
    setErrors((current) => ({ ...current, [field]: validate(values)[field] }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    setTriedSubmit(true);

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus("idle");
      setSummaryFocusRequest((n) => n + 1);
      return;
    }

    const form = new FormData(event.currentTarget);
    if (form.get("website")) {
      // Only automated submissions fill the hidden field. Drop them quietly.
      setStatus("sent");
      return;
    }

    setStatus("sending");
    const topicLabel = TOPICS.find((topic) => topic.value === values.topic)?.label ?? "Other";
    try {
      const res = await fetch("/api/proxy/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.fullName.trim(),
          email: values.email.trim(),
          phone_number: values.phone.trim() || undefined,
          subject: `Contact page: ${topicLabel}`,
          message: values.message.trim(),
          platform: "NG",
          category: values.topic === "mentorship" ? "mentorship" : "general",
          source_page: "/contact",
        }),
      });
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      const data = await res.json().catch(() => ({}));
      const ref = data?.data?.reference ?? data?.data?.id ?? data?.reference ?? data?.id ?? null;
      setReference(ref ? String(ref) : null);
      setValues(EMPTY);
      setErrors({});
      setTriedSubmit(false);
      setStatus("sent");
    } catch {
      // Keep everything the visitor typed so they can try again.
      setStatus("failed");
    }
  };

  const describedBy = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;
  const errorList = FIELD_ORDER.filter((field) => errors[field]);
  const sending = status === "sending";
  const messageLength = values.message.length;

  if (status === "sent") {
    return (
      <div className={s.success} role="status">
        <span className={s.successIcon}>
          <CheckCircle2 size={34} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h2 ref={successRef} tabIndex={-1}>
          Thank you. Your message has been received.
        </h2>
        <p>We will reply to the email address you provided.</p>
        {reference && (
          <p className={s.reference}>
            Reference: <strong>{reference}</strong>
          </p>
        )}
        <button type="button" className={s.secondaryButton} onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} className={s.form} onSubmit={handleSubmit} noValidate aria-describedby={id("required-note")}>
      <p id={id("required-note")} className={s.hint}>
        Fields marked <span className={s.required} aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>

      {errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} className={s.alert} role="alert" aria-labelledby={id("summary-title")}>
          <AlertCircle size={20} aria-hidden="true" />
          <div>
            <h3 id={id("summary-title")}>
              Please check {errorList.length === 1 ? "this field" : `these ${errorList.length} fields`}
            </h3>
            <ul>
              {errorList.map((field) => (
                <li key={field}>
                  <a href={`#${id(field)}`}>{FIELD_LABELS[field]}</a>: {errors[field]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {status === "failed" && (
        <div ref={failureRef} tabIndex={-1} className={s.alert} role="alert">
          <AlertCircle size={20} aria-hidden="true" />
          <div>
            <h3>We could not send your message.</h3>
            <p>
              Please try again or email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Your answers are still below.
            </p>
          </div>
        </div>
      )}

      <div className={s.row}>
        <div className={s.field}>
          <label htmlFor={id("fullName")} className={s.label}>
            Full name<span className={s.required} aria-hidden="true">*</span>
          </label>
          <input
            id={id("fullName")}
            name="name"
            className={s.input}
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={!!errors.fullName || undefined}
            aria-describedby={describedBy(errors.fullName && id("fullName-error"))}
            value={values.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            onBlur={() => revalidateOnBlur("fullName")}
            disabled={sending}
          />
          {errors.fullName && <FieldError id={id("fullName-error")}>{errors.fullName}</FieldError>}
        </div>

        <div className={s.field}>
          <label htmlFor={id("email")} className={s.label}>
            Email address<span className={s.required} aria-hidden="true">*</span>
          </label>
          <input
            id={id("email")}
            name="email"
            type="email"
            inputMode="email"
            className={s.input}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-required="true"
            aria-invalid={!!errors.email || undefined}
            aria-describedby={describedBy(id("email-hint"), errors.email && id("email-error"))}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => revalidateOnBlur("email")}
            disabled={sending}
          />
          <span id={id("email-hint")} className={s.hint}>We will send our reply here.</span>
          {errors.email && <FieldError id={id("email-error")}>{errors.email}</FieldError>}
        </div>
      </div>

      <fieldset
        className={s.fieldset}
        aria-required="true"
        aria-invalid={!!errors.topic || undefined}
        aria-describedby={describedBy(errors.topic && id("topic-error"))}
        disabled={sending}
      >
        <legend className={s.label}>
          Enquiry type<span className={s.required} aria-hidden="true">*</span>
        </legend>
        <div id={id("topic")} tabIndex={-1} className={`${s.topics} ${errors.topic ? s.topicsInvalid : ""}`}>
          {TOPICS.map((topic) => (
            <label key={topic.value} className={s.topic}>
              <input
                type="radio"
                name="topic"
                value={topic.value}
                checked={values.topic === topic.value}
                onChange={() => update("topic", topic.value)}
              />
              <span className={s.topicFace}>
                <Check size={15} strokeWidth={2.5} aria-hidden="true" />
                {topic.label}
              </span>
            </label>
          ))}
        </div>
        {errors.topic && (
          <div style={{ marginTop: 8 }}>
            <FieldError id={id("topic-error")}>{errors.topic}</FieldError>
          </div>
        )}
      </fieldset>

      {values.topic === "account" && (
        <p className={s.callout} id={id("account-tip")}>
          <ShieldAlert size={18} aria-hidden="true" />
          <span>
            Describe the issue and the email you sign in with. Never send passwords, payment-card
            details or confidential case records.
          </span>
        </p>
      )}

      <div className={s.field}>
        <label htmlFor={id("phone")} className={s.label}>
          Telephone number <span className={s.optional}>(optional)</span>
        </label>
        <input
          id={id("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          className={s.input}
          autoComplete="tel"
          aria-invalid={!!errors.phone || undefined}
          aria-describedby={describedBy(id("phone-hint"), errors.phone && id("phone-error"))}
          value={values.phone}
          onChange={(e) => update("phone", e.target.value)}
          onBlur={() => revalidateOnBlur("phone")}
          disabled={sending}
        />
        <span id={id("phone-hint")} className={s.hint}>Include your country code if you are outside Nigeria.</span>
        {errors.phone && <FieldError id={id("phone-error")}>{errors.phone}</FieldError>}
      </div>

      <div className={s.field}>
        <label htmlFor={id("message")} className={s.label}>
          Message<span className={s.required} aria-hidden="true">*</span>
        </label>
        <textarea
          ref={messageRef}
          id={id("message")}
          name="message"
          className={s.textarea}
          required
          aria-required="true"
          maxLength={MESSAGE_MAX}
          placeholder="Tell us what you need help with."
          aria-invalid={!!errors.message || undefined}
          aria-describedby={describedBy(
            id("message-privacy"),
            values.topic === "account" && id("account-tip"),
            errors.message && id("message-error"),
          )}
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          onBlur={() => revalidateOnBlur("message")}
          disabled={sending}
        />
        <div className={s.messageMeta}>
          {errors.message ? (
            <FieldError id={id("message-error")}>{errors.message}</FieldError>
          ) : (
            <span />
          )}
          <span className={`${s.counter} ${messageLength > MESSAGE_MAX - 100 ? s.counterNear : ""}`} aria-hidden="true">
            {messageLength}/{MESSAGE_MAX}
          </span>
        </div>
        <p className={s.callout} id={id("message-privacy")}>
          <Info size={18} aria-hidden="true" />
          <span>
            Please do not include confidential case information or personal details about people you
            support.
          </span>
        </p>
      </div>

      {/* Spam trap: real visitors never see or fill this. */}
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
        <button type="submit" className={s.submit} disabled={sending} aria-disabled={sending}>
          {sending ? (
            <>
              <Loader2 size={18} className={s.spinner} aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              Send Message <Send size={17} aria-hidden="true" />
            </>
          )}
        </button>
        <p className={s.replyNote} role="status" aria-live="polite">
          {sending ? "Sending your message, please wait." : "We will reply using the email address you provide."}
        </p>
      </div>
    </form>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span id={id} className={s.fieldError}>
      <AlertCircle size={15} aria-hidden="true" />
      {children}
    </span>
  );
}
