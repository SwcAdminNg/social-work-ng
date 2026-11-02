"use client";

import { useId, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  CircleAlert,
  Info,
  MapPin,
  Phone,
} from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
import SectionHeading from "./SectionHeading";
import { Reveal } from "./motion";
import { contact } from "./content";

type FormValues = {
  full_name: string;
  email: string;
  phone_number: string;
  organisation: string;
  message: string;
};

type Errors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = {
  full_name: "",
  email: "",
  phone_number: "",
  organisation: "",
  message: "",
};

// What each field needs before the enquiry can be sent.
function validate(values: FormValues): Errors {
  const errors: Errors = {};
  if (!values.full_name.trim()) errors.full_name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
    errors.email = "Enter a valid email address.";
  if (values.phone_number.replace(/\D/g, "").length < 7)
    errors.phone_number = "Enter a phone number we can reach you on.";
  if (!values.message.trim())
    errors.message = "Tell us a little about what you need.";
  return errors;
}

// A field in the Apple manner: the label sits inside the box and floats
// up to a small caption once the field has focus or a value.
function Field({
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
  name: keyof FormValues;
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
        <span className="text-gray-400 dark:text-[#ECF2EE]0"> · optional</span>
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

/**
 * "Let Us Turn Your Priorities into a Practical Plan". A deep-green closing
 * chapter: the invitation and contact details on the left, the enquiry form
 * on a white card to the right. Fields validate as you leave them and the
 * form checks everything again before sending.
 */
export default function HomeContact() {
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [failure, setFailure] = useState("");

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
    setTouched({
      full_name: true,
      email: true,
      phone_number: true,
      organisation: true,
      message: true,
    });
    setErrors(all);
    if (Object.keys(all).length > 0) {
      const first = Object.keys(all)[0];
      e.currentTarget
        .querySelector<HTMLElement>(`[name="${first}"]`)
        ?.focus();
      return;
    }

    setFailure("");
    setLoading(true);
    const organisation = form.organisation.trim();
    try {
      const res = await fetch("/api/proxy/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone_number: form.phone_number.trim(),
          subject: organisation
            ? `Website enquiry from ${organisation}`
            : "Website enquiry",
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

  const details = [
    { icon: Building2, label: "Organisation", value: contact.organisation },
    { icon: MapPin, label: "Our office", value: contact.address },
    {
      icon: Phone,
      label: "Telephone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
    },
  ];

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="relative bg-[#0c2a1e] text-white rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20 overflow-hidden"
    >
      <div
        className="absolute -top-32 left-[-10%] w-[34rem] h-[34rem] rounded-full bg-[#EBA937]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-12 lg:gap-16 items-start">
        <div>
          <SectionHeading
            id="contact-heading"
            eyebrow={contact.eyebrow}
            title={contact.title}
            tone="dark"
          >
            {contact.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </SectionHeading>

          <Reveal delay={0.2}>
            <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
              {details.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4 py-4">
                  <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-white/[0.07] text-[#F3C56B]">
                    <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white/50">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="mt-1 block text-[1rem] text-white hover:text-[#F3C56B] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 text-[1rem] text-white">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal from="up" delay={0.1}>
          <div className="bg-white dark:bg-[#16231C] text-gray-900 dark:text-[#ECF2EE] rounded-[32px] p-6 sm:p-10 ring-1 ring-black/5 dark:ring-white/10 shadow-[0_50px_100px_-50px_rgba(0,0,0,0.6)]">
            {sent ? (
              <div
                role="status"
                className="flex flex-col items-start gap-5 py-6"
              >
                <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#2D6A4F] text-white">
                  <Check className="w-7 h-7" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[1.5rem] font-bold tracking-[-0.02em]">
                    Thank you — your enquiry has been sent.
                  </p>
                  <p className="mt-2 t-body text-gray-600 dark:text-[#A3B3A9]">
                    We’ll be in touch to discuss the next step.
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
                  Send an enquiry
                </p>
                <p className="mt-1 text-[0.9rem] text-gray-500 dark:text-[#A3B3A9]">
                  We reply by email or telephone.
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
                    <Field
                      name="full_name"
                      label="Full name"
                      autoComplete="name"
                      value={form.full_name}
                      onChange={update("full_name")}
                      onBlur={leave("full_name")}
                      error={shown("full_name")}
                    />
                    <Field
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
                    <Field
                      name="phone_number"
                      label="Phone number"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      value={form.phone_number}
                      onChange={update("phone_number")}
                      onBlur={leave("phone_number")}
                      error={shown("phone_number")}
                    />
                    <Field
                      name="organisation"
                      label="Organisation"
                      autoComplete="organization"
                      optional
                      value={form.organisation}
                      onChange={update("organisation")}
                      onBlur={leave("organisation")}
                    />
                  </div>

                  <Field
                    name="message"
                    label="How can we help?"
                    multiline
                    value={form.message}
                    onChange={update("message")}
                    onBlur={leave("message")}
                    error={shown("message")}
                    hint={contact.messagePrompt}
                  />

                  <p className="flex gap-2.5 pt-1 text-[0.82rem] leading-relaxed text-gray-500 dark:text-[#A3B3A9]">
                    <Info
                      className="w-4 h-4 mt-0.5 shrink-0 text-[#B7791F]"
                      aria-hidden="true"
                    />
                    {contact.notice}
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
                        {contact.button}
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
