"use client";

import { useState } from "react";
import { ArrowRight, Check, CircleAlert, Info } from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
import FormField from "@/components/shared/FormField";

export type EnquiryFormConfig = {
  heading: string;
  replyNote: string;
  // Shown as a text field when set; otherwise the subject is derived.
  subjectLabel?: string;
  // Used as the subject when no subject field is shown.
  defaultSubject: string;
  messageLabel: string;
  messagePrompt?: string;
  notice?: string;
  button: string;
  category: "general" | "mentorship" | "pricing" | "courses";
  // Path of the page the form lives on, recorded on the message.
  sourcePage: string;
  confirmation: { title: string; text: string };
};

type FormValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type Errors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = { name: "", email: "", phone: "", subject: "", message: "" };

/**
 * A simple enquiry form on a card: name, email, optional phone, an
 * optional subject and the message. Fields are checked as you leave
 * them, what you typed survives any error, and the confirmation shows
 * only once the enquiry has actually been sent.
 */
export default function EnquiryForm({ config }: { config: EnquiryFormConfig }) {
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState("");

  const validate = (values: FormValues): Errors => {
    const errs: Errors = {};
    if (!values.name.trim()) errs.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      errs.email = "Enter a valid email address.";
    if (values.phone.trim() && values.phone.replace(/\D/g, "").length < 7)
      errs.phone = "Enter a phone number we can reach you on, or leave it blank.";
    if (config.subjectLabel && !values.subject.trim())
      errs.subject = "Tell us what your message is about.";
    if (!values.message.trim()) errs.message = "Write your message.";
    return errs;
  };

  const update = (name: keyof FormValues) => (value: string) => {
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name]) setErrors(validate(next));
  };

  const leave = (name: keyof FormValues) => () => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(form));
  };

  const shown = (name: keyof FormValues) => (touched[name] ? errors[name] : undefined);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const all = validate(form);
    setTouched({ name: true, email: true, phone: true, subject: true, message: true });
    setErrors(all);
    if (Object.keys(all).length > 0) {
      const first = Object.keys(all)[0];
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setFailure("");
    setLoading(true);
    const phone = form.phone.trim();
    try {
      const res = await fetch("/api/proxy/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.name.trim(),
          email: form.email.trim(),
          phone_number: phone || undefined,
          subject: config.subjectLabel ? form.subject.trim() : config.defaultSubject,
          message: form.message,
          platform: "NG",
          category: config.category,
          source_page: config.sourcePage,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "We couldn’t send your message. Please try again.");
      }
      setSent(true);
      setForm(emptyForm);
      setTouched({});
      setErrors({});
    } catch (err) {
      setFailure(
        err instanceof Error ? err.message : "We couldn’t send your message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#16231C] text-gray-900 dark:text-[#ECF2EE] rounded-[32px] p-6 sm:p-10 ring-1 ring-black/5 dark:ring-white/10 shadow-[0_50px_100px_-50px_rgba(20,64,47,0.35)] dark:shadow-none">
      {sent ? (
        <div role="status" className="flex flex-col items-start gap-5 py-6">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#2D6A4F] text-white">
            <Check className="w-7 h-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[1.35rem] leading-snug font-bold tracking-[-0.02em]">
              {config.confirmation.title}
            </p>
            <p className="mt-3 t-body text-gray-600 dark:text-[#A3B3A9]">
              {config.confirmation.text}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="group inline-flex items-center gap-2 text-[0.95rem] font-bold text-[#2D6A4F] dark:text-[#74c69d] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] cursor-pointer"
          >
            Send another message
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <p className="text-[1.25rem] font-bold tracking-[-0.02em]">{config.heading}</p>
          <p className="mt-1 text-[0.9rem] text-gray-500 dark:text-[#A3B3A9]">{config.replyNote}</p>

          <div className="mt-7 space-y-4">
            {failure && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-[0.9rem] font-medium"
              >
                <CircleAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                {failure}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                name="name"
                label="Full name"
                autoComplete="name"
                value={form.name}
                onChange={update("name")}
                onBlur={leave("name")}
                error={shown("name")}
              />
              <FormField
                name="email"
                label="Email address"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={form.email}
                onChange={update("email")}
                onBlur={leave("email")}
                error={shown("email")}
              />
              <FormField
                name="phone"
                label="Phone number"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                optional
                value={form.phone}
                onChange={update("phone")}
                onBlur={leave("phone")}
                error={shown("phone")}
              />
              {config.subjectLabel && (
                <FormField
                  name="subject"
                  label={config.subjectLabel}
                  value={form.subject}
                  onChange={update("subject")}
                  onBlur={leave("subject")}
                  error={shown("subject")}
                />
              )}
            </div>

            <FormField
              name="message"
              label={config.messageLabel}
              multiline
              value={form.message}
              onChange={update("message")}
              onBlur={leave("message")}
              error={shown("message")}
              hint={config.messagePrompt}
            />

            {config.notice && (
              <p className="flex gap-2.5 pt-1 text-[0.82rem] leading-relaxed text-gray-500 dark:text-[#A3B3A9]">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#B7791F]" aria-hidden="true" />
                {config.notice}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 w-full h-14 bg-[#2D6A4F] text-white text-[1rem] font-bold rounded-2xl hover:bg-[#1e4d38] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition-[background-color,scale,opacity] duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2D6A4F]/40"
            >
              {loading ? (
                <>
                  <IconSpinner />
                  Sending…
                </>
              ) : (
                <>
                  {config.button}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
