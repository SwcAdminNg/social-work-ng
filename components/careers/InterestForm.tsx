"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  Info,
  Paperclip,
} from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
import FormField from "@/components/shared/FormField";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { interest, opportunityTypes, type OpportunityType } from "./content";
import { INTEREST_EVENT } from "./interestEvent";

type FormValues = {
  name: string;
  email: string;
  phone: string;
  type: OpportunityType | "";
  reference: string;
  statement: string;
};

type Errors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = {
  name: "",
  email: "",
  phone: "",
  type: "",
  reference: "",
  statement: "",
};

// Name, email, the opportunity type, the reference or area and the
// statement are required; phone is optional, as the handover asks.
function validate(values: FormValues): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (values.phone.trim() && values.phone.replace(/\D/g, "").length < 7)
    errors.phone = "Enter a phone number we can reach you on, or leave it blank.";
  if (!values.type) errors.type = "Choose the kind of opportunity you are interested in.";
  if (!values.reference.trim())
    errors.reference = "Enter a role reference or describe your area of interest.";
  if (!values.statement.trim())
    errors.statement = "Tell us about your experience and the contribution you would like to make.";
  return errors;
}

// The opportunity type, chosen from the four kinds. Styled to sit
// alongside the floating-label fields.
function TypeSelect({
  value,
  onChange,
  onBlur,
  error,
}: {
  value: FormValues["type"];
  onChange: (value: FormValues["type"]) => void;
  onBlur: () => void;
  error?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const { labels } = interest.form;
  return (
    <div>
      <div className="relative">
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-2.5 text-[0.72rem] font-semibold tracking-wide text-gray-500 dark:text-[#A3B3A9]"
        >
          {labels.type}
        </label>
        <select
          id={id}
          name="type"
          value={value}
          onChange={(e) => onChange(e.target.value as FormValues["type"])}
          onBlur={onBlur}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required
          className={`peer w-full appearance-none h-14 px-4 pt-5 pb-1 pr-11 rounded-2xl bg-[#F5F5F7] dark:bg-white/[0.06] text-[1rem] ring-1 ring-inset outline-none transition-[background-color,box-shadow] duration-200 cursor-pointer ${
            value ? "text-gray-900 dark:text-[#ECF2EE]" : "text-gray-500 dark:text-[#A3B3A9]"
          } ${
            error
              ? "ring-red-500/70 focus:ring-2 focus:ring-red-500"
              : "ring-transparent hover:ring-black/10 dark:hover:ring-white/15 focus:bg-white dark:focus:bg-[#0F1A14] focus:ring-2 focus:ring-[#2D6A4F]"
          }`}
        >
          <option value="">{labels.typePlaceholder}</option>
          {opportunityTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-[#A3B3A9]"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-[0.8rem] leading-snug text-red-600 dark:text-red-400"
        >
          <CircleAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * "Tell Us How You Would Like to Contribute". The guidance on the left;
 * the expression-of-interest form on a card to the right. The
 * opportunity buttons above preselect the type; fields are checked as
 * you leave them, what you typed survives any error, and the
 * confirmation shows only once the enquiry has actually been sent.
 */
export default function InterestForm() {
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState("");
  const { form: f, confirmation } = interest;

  // Preselect the opportunity type announced by the buttons above.
  useEffect(() => {
    const onInterest = (e: Event) => {
      const type = (e as CustomEvent<OpportunityType>).detail;
      setForm((prev) => ({ ...prev, type }));
      setSent(false);
    };
    window.addEventListener(INTEREST_EVENT, onInterest);
    return () => window.removeEventListener(INTEREST_EVENT, onInterest);
  }, []);

  const update = (name: keyof FormValues) => (value: string) => {
    const next = { ...form, [name]: value } as FormValues;
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
    setTouched({ name: true, email: true, phone: true, type: true, reference: true, statement: true });
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
          subject: `${f.subject}: ${form.type}`,
          message: [
            `Opportunity type: ${form.type}`,
            `Role reference or area of interest: ${form.reference.trim()}`,
            "",
            form.statement,
          ].join("\n"),
          platform: "NG",
          category: "general",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message || "We couldn’t send your expression of interest. Please try again.",
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
          : "We couldn’t send your expression of interest. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="interest"
      aria-labelledby="interest-heading"
      className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-12 lg:gap-16 items-start">
        <div>
          <SectionHeading
            id="interest-heading"
            eyebrow={interest.eyebrow}
            title={interest.title}
          >
            {interest.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </SectionHeading>

          <Reveal delay={0.15}>
            <div className="mt-8 rounded-[24px] bg-[#EEF5F1] dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 p-6">
              <p className="flex items-center gap-2.5 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-[#A3B3A9]">
                <Paperclip className="w-4 h-4 text-[#B7791F]" aria-hidden="true" />
                {f.documents.label}
              </p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-gray-700 dark:text-[#C3D1C8]">
                {f.documents.note}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal from="up" delay={0.1}>
          <div className="bg-[#EEF5F1] dark:bg-[#16231C] text-gray-900 dark:text-[#ECF2EE] rounded-[32px] p-6 sm:p-10 ring-1 ring-black/5 dark:ring-white/10">
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
                  Send another expression of interest
                  <ArrowRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[1.25rem] font-bold tracking-[-0.02em]">
                    {f.heading}
                  </p>
                  <span className="inline-flex items-center rounded-full bg-white dark:bg-[#0F1A14] ring-1 ring-black/5 dark:ring-white/10 px-3 py-1 text-[0.72rem] font-semibold tracking-wide text-[#14402F] dark:text-[#C3D1C8]">
                    {interest.note}
                  </span>
                </div>

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
                      label={f.labels.name}
                      autoComplete="name"
                      value={form.name}
                      onChange={update("name")}
                      onBlur={leave("name")}
                      error={shown("name")}
                    />
                    <FormField
                      name="email"
                      label={f.labels.email}
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
                      label={f.labels.phone}
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      optional
                      value={form.phone}
                      onChange={update("phone")}
                      onBlur={leave("phone")}
                      error={shown("phone")}
                    />
                    <TypeSelect
                      value={form.type}
                      onChange={update("type")}
                      onBlur={leave("type")}
                      error={shown("type")}
                    />
                  </div>

                  <FormField
                    name="reference"
                    label={f.labels.reference}
                    value={form.reference}
                    onChange={update("reference")}
                    onBlur={leave("reference")}
                    error={shown("reference")}
                    hint={f.referenceGuidance}
                  />

                  <FormField
                    name="statement"
                    label={f.labels.statement}
                    multiline
                    value={form.statement}
                    onChange={update("statement")}
                    onBlur={leave("statement")}
                    error={shown("statement")}
                    hint={f.statementGuidance}
                  />

                  <p className="flex gap-2.5 pt-1 text-[0.82rem] leading-relaxed text-gray-500 dark:text-[#A3B3A9]">
                    <Info
                      className="w-4 h-4 mt-0.5 shrink-0 text-[#B7791F]"
                      aria-hidden="true"
                    />
                    <span>
                      Please read our{" "}
                      <Link
                        href={f.privacy.href}
                        className="text-[#2D6A4F] dark:text-[#74c69d] underline underline-offset-4 decoration-[#2D6A4F]/30 hover:decoration-current rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
                      >
                        {f.privacy.linkLabel}
                      </Link>{" "}
                      before submitting your details. {f.privacy.caution}
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
                        {f.button}
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
