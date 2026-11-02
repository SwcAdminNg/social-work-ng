"use client";

import { useState } from "react";
import { Building2, Info, MapPin, Phone, Send } from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
import SectionHeading from "./SectionHeading";
import { Reveal } from "./motion";
import { contact } from "./content";

const emptyForm = {
  full_name: "",
  email: "",
  phone_number: "",
  organisation: "",
  message: "",
};

const inputClass =
  "w-full bg-[#F6F8F7] dark:bg-gray-950 border border-transparent dark:border-white/10 rounded-2xl px-4 py-3.5 text-[0.98rem] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 hover:border-gray-200 focus:bg-white dark:focus:bg-gray-950 focus:outline-none focus:ring-4 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-[background-color,border-color,box-shadow] duration-200";

const labelClass =
  "block text-[0.85rem] font-semibold text-gray-700 dark:text-gray-300 mb-2";

/**
 * "Let Us Turn Your Priorities into a Practical Plan". A deep-green closing
 * chapter: the invitation and contact details on the left, the enquiry form
 * on a white card to the right.
 */
export default function HomeContact() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const organisation = form.organisation.trim();
    try {
      const res = await fetch("/api/proxy/contact-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone_number: form.phone_number || undefined,
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

      setSuccess(true);
      setForm(emptyForm);
    } catch (err) {
      setError(
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
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-[32px] p-7 sm:p-10 ring-1 ring-black/5 dark:ring-white/10 shadow-[0_50px_100px_-50px_rgba(0,0,0,0.6)]"
          >
            <div className="space-y-6">
              {error && (
                <div
                  role="alert"
                  className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl text-sm font-semibold border border-red-200 dark:border-red-800/30"
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  role="status"
                  className="p-4 bg-[#2D6A4F]/10 text-[#1e4d38] dark:text-[#74c69d] rounded-2xl text-sm font-semibold border border-[#2D6A4F]/20"
                >
                  Thank you — your enquiry has been sent. We’ll be in touch to
                  discuss the next step.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="home-full-name" className={labelClass}>
                    Full name
                  </label>
                  <input
                    id="home-full-name"
                    name="full_name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.full_name}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="home-email" className={labelClass}>
                    Email address
                  </label>
                  <input
                    id="home-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="home-phone" className={labelClass}>
                    Phone number{" "}
                    <span className="font-normal text-gray-400">
                      — optional
                    </span>
                  </label>
                  <input
                    id="home-phone"
                    name="phone_number"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone_number}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="home-organisation" className={labelClass}>
                    Organisation{" "}
                    <span className="font-normal text-gray-400">
                      — if applicable
                    </span>
                  </label>
                  <input
                    id="home-organisation"
                    name="organisation"
                    type="text"
                    autoComplete="organization"
                    value={form.organisation}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="home-message" className={labelClass}>
                  How can we help?
                </label>
                <textarea
                  id="home-message"
                  name="message"
                  required
                  rows={5}
                  placeholder={contact.messagePrompt}
                  value={form.message}
                  onChange={handleChange}
                  className={`${inputClass} resize-y`}
                />
              </div>

              <p className="flex gap-2.5 text-[0.85rem] leading-relaxed text-gray-500 dark:text-gray-400">
                <Info
                  className="w-4 h-4 mt-0.5 shrink-0 text-[#B7791F]"
                  aria-hidden="true"
                />
                {contact.notice}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-[54px] px-8 bg-[#2D6A4F] text-white text-[1rem] font-bold rounded-full shadow-lg shadow-[#2D6A4F]/25 hover:bg-[#1e4d38] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.97] transition-[background-color,scale,opacity] duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2D6A4F]/40"
              >
                {loading ? (
                  <IconSpinner />
                ) : (
                  <Send className="w-4 h-4" aria-hidden="true" />
                )}
                {loading ? "Sending…" : contact.button}
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
