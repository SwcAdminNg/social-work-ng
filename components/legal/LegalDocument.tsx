import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/home/motion";

export type LegalSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  // Gold tone for a closing contact or action card.
  tone?: "default" | "gold";
};

/**
 * A long document on the white sheet: a sticky table of contents on
 * large screens and the sections as rounded cards with their icons.
 * Used by the privacy and terms pages.
 */
export default function LegalDocument({
  intro,
  sections,
}: {
  intro?: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <section
      aria-label="Document"
      className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-16 pb-24 md:pt-20 md:pb-32"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <aside className="hidden lg:block lg:col-span-4">
          <nav
            aria-label="Contents"
            className="sticky top-28 rounded-[28px] bg-[#EEF5F1] dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 p-6"
          >
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-[#A3B3A9]">
              Contents
            </p>
            <ol className="mt-4 space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[0.92rem] font-semibold text-gray-700 dark:text-[#C3D1C8] hover:bg-white dark:hover:bg-[#0F1A14] hover:text-[#14402F] dark:hover:text-[#ECF2EE] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
                    >
                      <Icon className="w-4 h-4 text-[#2D6A4F] dark:text-[#74c69d]" aria-hidden="true" />
                      {section.title}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        <div className="lg:col-span-8 space-y-5">
          {intro && (
            <Reveal>
              <div className="rounded-[28px] bg-[#EEF5F1] dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10 p-7 md:p-9">
                {intro}
              </div>
            </Reveal>
          )}
          {sections.map((section, i) => {
            const Icon = section.icon;
            const gold = section.tone === "gold";
            return (
              <Reveal key={section.id} delay={Math.min(i, 3) * 0.04}>
                <article
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className={`scroll-mt-28 rounded-[28px] p-7 md:p-9 ${
                    gold
                      ? "bg-[#EBA937] text-[#10291E]"
                      : "bg-white dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex items-center justify-center w-12 h-12 shrink-0 rounded-full ${
                        gold
                          ? "bg-[#10291E]/10 text-[#10291E]"
                          : "bg-[#EEF5F1] dark:bg-[#0F1A14] text-[#2D6A4F] dark:text-[#74c69d]"
                      }`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h2
                      id={`${section.id}-title`}
                      className={`t-h3 font-bold ${gold ? "" : "text-gray-900 dark:text-[#ECF2EE]"}`}
                    >
                      {section.title}
                    </h2>
                  </div>
                  <div
                    className={`mt-6 space-y-4 t-body ${
                      gold ? "text-[#10291E]/80" : "text-gray-600 dark:text-[#A3B3A9]"
                    }`}
                  >
                    {section.children}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// A bulleted point inside a section.
export function Point({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="mt-[0.6rem] w-1.5 h-1.5 shrink-0 rounded-full bg-[#EBA937]" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

// Emphasised words inside a point.
export function Term({ children }: { children: React.ReactNode }) {
  return <strong className="font-bold text-gray-900 dark:text-[#ECF2EE]">{children}</strong>;
}
