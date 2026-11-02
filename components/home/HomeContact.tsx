"use client";

import { useState } from "react";
import { Info, MapPin, Phone, Send } from "lucide-react";
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
  "w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-[0.95rem] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/40 focus:border-[#2D6A4F] transition-all";

const labelClass =
  "block text-[0.85rem] font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

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

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-24 bg-[#EEF5F1] dark:bg-[#0f1713] py-20 md:py-24 px-6"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[5fr_6fr] gap-12 lg:gap-16 items-start">
        <Reveal from="left">
          <SectionHeading
            id="contact-heading"
            eyebrow={contact.eyebrow}
            title={contact.title}
            align="left"
          >
            {contact.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </SectionHeading>

          <ul className="mt-8 space-y-4">
            <li className="flex items-start gap-4">
              <span className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-white dark:bg-gray-900 text-[#2D6A4F] dark:text-[#52b788] shadow-sm">
                <MapPin className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                  Our office
                </p>
                <p className="mt-0.5 text-[0.95rem] text-gray-800 dark:text-gray-200">
                  {contact.address}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-white dark:bg-gray-900 text-[#2D6A4F] dark:text-[#52b788] shadow-sm">
                <Phone className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                  Telephone
                </p>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="mt-0.5 block text-[0.95rem] text-gray-800 dark:text-gray-200 hover:text-[#2D6A4F] dark:hover:text-[#52b788]"
                >
                  {contact.phone}
                </a>
              </div>
            </li>
          </ul>
        </Reveal>

        <Reveal from="right">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 rounded-3xl p-7 sm:p-9 border border-black/5 dark:border-gray-800 shadow-xl shadow-[#2D6A4F]/5 dark:shadow-none"
          >
            <div className="space-y-5">
              {error && (
                <div
                  role="alert"
                  className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-800/30"
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  role="status"
                  className="p-4 bg-[#2D6A4F]/10 text-[#1e4d38] dark:text-[#74c69d] rounded-xl text-sm font-semibold border border-[#2D6A4F]/20"
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

              <p className="flex gap-2.5 text-[0.82rem] leading-relaxed text-gray-500 dark:text-gray-400">
                <Info
                  className="w-4 h-4 mt-0.5 shrink-0 text-[#EBA937]"
                  aria-hidden="true"
                />
                {contact.notice}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#2D6A4F] text-white text-[0.95rem] font-bold rounded-full shadow-lg shadow-[#2D6A4F]/20 hover:bg-[#1e4d38] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.97] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] focus-visible:ring-offset-2"
              >
                {loading ? (
                  <IconSpinner />
                ) : (
                  <Send className="w-4 h-4" aria-hidden="true" />
                )}
                {loading ? "Sending…" : "Send Your Enquiry"}
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
