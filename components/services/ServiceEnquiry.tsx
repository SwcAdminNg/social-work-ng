"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CircleAlert, Info } from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
import FormField from "@/components/shared/FormField";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import type { ServicePageContent } from "./types";

type FormValues = {
  name: string;
  email: string;
  organisation: string;
  phone: string;
  message: string;
};

type Errors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = {
  name: "",
  email: "",
  organisation: "",
  phone: "",
  message: "",
};

// Name, email and the enquiry itself are required; organisation and
// phone are optional, as the handovers ask.
function validate(values: FormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (values.phone.trim() && values.phone.replace(/\D/g, "").length < 7)
    errors.phone = "Enter a phone number we can reach you on, or leave it blank.";
  if (!values.message.trim())
    errors.message = "Tell us about the issue and the support you need.";
  return errors;
}

/**
 * The service page's enquiry: the invitation and what to include on the
 * left; the form on a card to the right. Fields are checked as you leave
 * them, what you typed survives any error, and the confirmation shows
 * only once the enquiry has actually been sent.
 */
export default function ServiceEnquiry({
  enquiry,
}: {
  enquiry: ServicePageContent["enquiry"];
}) {
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState("");
  const { form: labels, confirmation } = enquiry;

  const update = (name: keyof FormValues) => (value: string) => {
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name]) setErrors(validate(next));
  };

  const leave = (name: keyof FormValues) => () => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors(validate(form));
  };

  const shown = (name: keyof FormValues) =>
    touched[name] ? errors[name] : undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const all = validate(form);
    setTouched({ name: true, email: true, organisation: true, phone: true, message: true });
    setErrors(all);
    if (Object.keys(all).length > 0) {
      const first = Object.keys(all)[0];
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setFailure("");
    setLoading(true);
    const organisation = form.organisation.trim();
    const phone = form.phone.trim();
    try {
      const res = await fetch("/api/proxy/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.name.trim(),
          email: form.email.trim(),
          phone_number: phone || undefined,
          subject: organisation
            ? `${labels.subject} from ${organisation}`
            : labels.subject,
          message: organisation
            ? `Organisation: ${organisation}\n\n${form.message}`
            : form.message,
          platform: "NG",
          category: "general",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message || "We couldn’t send your enquiry. Please try again.",
        );
      }
      setSent(true);
      setForm(emptyForm);
      setTouched({});
      setErrors({});
    } catch (err) {
      setFailure(
        err instanceof Error
          ? err.message
          : "We couldn’t send your enquiry. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="enquiry"
      aria-labelledby="enquiry-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-12 lg:gap-16 items-start">
        <div>
          <SectionHeading
            id="enquiry-heading"
            eyebrow={enquiry.eyebrow}
            title={enquiry.title}
          >
            {enquiry.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </SectionHeading>

          <Reveal delay={0.15}>
            <p className="mt-10 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-[#A3B3A9]">
              {enquiry.helpfulLead}
            </p>
            <ul className="mt-4 divide-y divide-gray-900/10 dark:divide-white/10 border-y border-gray-900/10 dark:border-white/10">
              {enquiry.helpful.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3.5 py-3.5 text-[0.98rem] leading-snug text-gray-800 dark:text-[#D7E2DB]"
                >
                  <span
                    className="mt-[0.45rem] w-1.5 h-1.5 shrink-0 rounded-full bg-[#EBA937]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal from="up" delay={0.1}>
          <div className="bg-white dark:bg-[#16231C] text-gray-900 dark:text-[#ECF2EE] rounded-[32px] p-6 sm:p-10 ring-1 ring-black/5 dark:ring-white/10 shadow-[0_50px_100px_-50px_rgba(20,64,47,0.35)] dark:shadow-none">
            {sent ? (
              <div role="status" className="flex flex-col items-start gap-5 py-6">
                <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#2D6A4F] text-white">
                  <Check className="w-7 h-7" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[1.35rem] leading-snug font-bold tracking-[-0.02em]">
                    {confirmation.title}
                  </p>
                  <p className="mt-3 t-body text-gray-600 dark:text-[#A3B3A9]">
                    {confirmation.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="group inline-flex items-center gap-2 text-[0.95rem] font-bold text-[#2D6A4F] dark:text-[#74c69d] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] cursor-pointer"
                >
                  Send another enquiry
                  <ArrowRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <p className="text-[1.25rem] font-bold tracking-[-0.02em]">
                  {labels.heading}
                </p>
                <p className="mt-1 text-[0.9rem] text-gray-500 dark:text-[#A3B3A9]">
                  {labels.replyNote}
                </p>

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
                      label={labels.labels.name}
                      autoComplete="name"
                      value={form.name}
                      onChange={update("name")}
                      onBlur={leave("name")}
                      error={shown("name")}
                    />
                    <FormField
                      name="email"
                      label={labels.labels.email}
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={form.email}
                      onChange={update("email")}
                      onBlur={leave("email")}
                      error={shown("email")}
                    />
                    <FormField
                      name="organisation"
                      label={labels.labels.organisation}
                      autoComplete="organization"
                      optional
                      value={form.organisation}
                      onChange={update("organisation")}
                      onBlur={leave("organisation")}
                    />
                    <FormField
                      name="phone"
                      label={labels.labels.phone}
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      optional
                      value={form.phone}
                      onChange={update("phone")}
                      onBlur={leave("phone")}
                      error={shown("phone")}
                    />
                  </div>

                  <FormField
                    name="message"
                    label={labels.labels.message}
                    multiline
                    value={form.message}
                    onChange={update("message")}
                    onBlur={leave("message")}
                    error={shown("message")}
                    hint={labels.messagePrompt}
                  />

                  <p className="flex gap-2.5 pt-1 text-[0.82rem] leading-relaxed text-gray-500 dark:text-[#A3B3A9]">
                    <Info
                      className="w-4 h-4 mt-0.5 shrink-0 text-[#B7791F]"
                      aria-hidden="true"
                    />
                    <span>
                      {enquiry.notice} Read our{" "}
                      <Link
                        href={labels.privacy.href}
                        className="text-[#2D6A4F] dark:text-[#74c69d] underline underline-offset-4 decoration-[#2D6A4F]/30 hover:decoration-current rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
                      >
                        {labels.privacy.label}
                      </Link>
                      .
                    </span>
                  </p>

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
                        {labels.button}
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
