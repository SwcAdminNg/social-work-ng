import { Building2, Mail, MapPin, Phone } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import EnquiryForm from "@/components/shared/EnquiryForm";
import { form, reach } from "./content";

/**
 * How to reach us on the left (organisation, office, telephone, email)
 * and the message form on a card to the right, on the white sheet.
 */
export function ContactForm() {
  const { details } = reach;
  const items = [
    { icon: Building2, label: "Organisation", value: details.organisation },
    { icon: MapPin, label: "Our office", value: details.address },
    {
      icon: Phone,
      label: "Telephone",
      value: details.phone,
      href: `tel:${details.phone.replace(/\s/g, "")}`,
    },
    { icon: Mail, label: "Email", value: details.email, href: `mailto:${details.email}` },
  ];

  return (
    <section
      id="message"
      aria-labelledby="reach-heading"
      className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-20 pb-24 md:pt-24 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-12 lg:gap-16 items-start">
        <div>
          <SectionHeading id="reach-heading" eyebrow={reach.eyebrow} title={reach.title}>
            {reach.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </SectionHeading>

          <Reveal delay={0.2}>
            <ul className="mt-10 divide-y divide-gray-900/10 dark:divide-white/10 border-y border-gray-900/10 dark:border-white/10">
              {items.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4 py-4">
                  <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-[#EEF5F1] dark:bg-[#16231C] text-[#2D6A4F] dark:text-[#74c69d]">
                    <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-[#A3B3A9]">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="mt-1 block text-[1rem] text-gray-900 dark:text-[#ECF2EE] hover:text-[#2D6A4F] dark:hover:text-[#74c69d] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] [overflow-wrap:anywhere]"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 text-[1rem] text-gray-900 dark:text-[#ECF2EE]">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal from="up" delay={0.1}>
          <EnquiryForm config={form} />
        </Reveal>
      </div>
    </section>
  );
}
