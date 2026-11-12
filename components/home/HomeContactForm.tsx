"use client";

import { useId, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import s from "./Home.module.css";

type Values = { name: string; organisation: string; email: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;
type Status = "idle" | "sending" | "sent" | "failed" | "limited";

const EMPTY: Values = { name: "", organisation: "", email: "", message: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Enter your name so we know who to reply to.";
  if (!v.email.trim()) e.email = "Enter your email address so we can reply.";
  else if (!EMAIL_PATTERN.test(v.email.trim())) e.email = "Enter a valid email address.";
  const message = v.message.trim();
  if (!message) e.message = "Tell us a little about what you need.";
  else if (message.length < 10) e.message = "Add a few more words so we can understand your request.";
  return e;
}

export default function HomeContactForm() {
  const uid = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  const set = (field: keyof Values) => (event: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as (keyof Values)[])[0];
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    if (new FormData(event.currentTarget).get("website")) {
      setStatus("sent");
      return;
    }

    setStatus("sending");
    const organisation = values.organisation.trim();
    try {
      const res = await fetch("/api/proxy/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.name.trim(),
          email: values.email.trim(),
          subject: organisation ? `Homepage enquiry from ${organisation}` : "Homepage enquiry",
          message: organisation ? `Organisation: ${organisation}\n\n${values.message.trim()}` : values.message.trim(),
          platform: "NG",
          category: organisation ? "partnership" : "other",
          source_page: "/",
        }),
      });
      if (res.status === 429) return setStatus("limited");
      if (!res.ok) throw new Error(String(res.status));
      setValues(EMPTY);
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <div className={s.formCard} role="status">
        <div className={s.formSent}>
          <CheckCircle2 size={36} aria-hidden="true" />
          <p className={s.formSentTitle}>Thank you. Your enquiry has been received.</p>
          <p>We will reply to the email address you provided.</p>
          <button type="button" className={s.btnLink} onClick={() => setStatus("idle")}>
            Send another message
          </button>
        </div>
      </div>
    );
  }

  const field = (name: keyof Values) => ({
    id: `${uid}-${name}`,
    name,
    value: values[name],
    onChange: set(name),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${uid}-${name}-error` : undefined,
  });

  const error = (name: keyof Values) =>
    errors[name] ? (
      <span id={`${uid}-${name}-error`} className={s.fieldError}>
        {errors[name]}
      </span>
    ) : null;

  return (
    <form className={s.formCard} onSubmit={onSubmit} noValidate>
      <div className={s.formRow}>
        <div className={s.field}>
          <label htmlFor={`${uid}-name`} className="sr-only">Name</label>
          <input {...field("name")} type="text" autoComplete="name" placeholder="Name" />
          {error("name")}
        </div>
        <div className={s.field}>
          <label htmlFor={`${uid}-organisation`} className="sr-only">Organisation (optional)</label>
          <input {...field("organisation")} type="text" autoComplete="organization" placeholder="Organisation (optional)" />
        </div>
      </div>
      <div className={s.field}>
        <label htmlFor={`${uid}-email`} className="sr-only">Email address</label>
        <input {...field("email")} type="email" autoComplete="email" placeholder="Email address" />
        {error("email")}
      </div>
      <div className={s.field}>
        <label htmlFor={`${uid}-message`} className="sr-only">Your message</label>
        <textarea {...field("message")} rows={5} maxLength={2000} placeholder="Your message" />
        {error("message")}
      </div>
      <div className={s.honeypot} aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p className={s.formNote}>Please avoid including confidential case details or sensitive personal information.</p>
      {status === "failed" && (
        <p className={s.formAlert} role="alert">We could not send your message. Please try again in a moment.</p>
      )}
      {status === "limited" && (
        <p className={s.formAlert} role="alert">You have sent several messages recently. Please wait a few minutes and try again.</p>
      )}
      <button type="submit" className={s.btnGreen} disabled={status === "sending"}>
        {status === "sending" ? <><Loader2 className={s.spin} size={18} aria-hidden="true" /> Sending…</> : "Send message"}
      </button>
    </form>
  );
}
