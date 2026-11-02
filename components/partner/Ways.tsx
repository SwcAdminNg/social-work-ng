import Link from "next/link";
import {
  BookOpenCheck,
  Briefcase,
  GraduationCap,
  Microscope,
} from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { ways } from "./content";

const icons = [GraduationCap, Briefcase, BookOpenCheck, Microscope];

// Links the learning platform's name wherever the copy mentions it.
function Copy({ text }: { text: string }) {
  const parts = text.split(ways.platformName);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <Link
              href={ways.platformHref}
              className="text-[#2D6A4F] dark:text-[#74c69d] underline underline-offset-4 decoration-[#2D6A4F]/30 hover:decoration-current rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
            >
              {ways.platformName}
            </Link>
          )}
        </span>
      ))}
    </>
  );
}

/**
 * "Ways to Partner With Us". The four routes as numbered rows: the
 * route named with its icon and one-line statement on the left, the
 * fuller explanation on the right, divided by hairlines.
 */
export default function Ways() {
  return (
    <section
      id="ways"
      aria-labelledby="ways-heading"
      className="relative bg-white dark:bg-[#0B1410] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-20 pb-24 md:pt-24 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading
          id="ways-heading"
          eyebrow={ways.eyebrow}
          title={ways.title}
          align="center"
        />

        <ol className="mt-14 md:mt-20 border-t border-gray-900/10 dark:border-white/10">
          {ways.items.map((route, i) => {
            const Icon = icons[i];
            return (
              <li
                key={route.id}
                id={`way-${route.id}`}
                className="grid lg:grid-cols-12 gap-6 lg:gap-16 py-10 md:py-14 border-b border-gray-900/10 dark:border-white/10 scroll-mt-28"
              >
                <Reveal from="left" className="lg:col-span-5">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-[#EBA937]/15 text-[#B7791F] dark:text-[#F3C56B]">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span
                      className="text-[0.78rem] font-bold tracking-[0.18em] text-[#B7791F] dark:text-[#F3C56B]"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-6 t-h3 font-bold text-gray-900 dark:text-[#ECF2EE]">
                    {route.title}
                  </h3>
                  <p className="mt-4 text-[1.05rem] md:text-[1.1rem] leading-[1.5] font-medium text-[#14402F] dark:text-[#C3D1C8] max-w-[40ch]">
                    {route.statement}
                  </p>
                </Reveal>
                <Reveal
                  from="right"
                  delay={0.08}
                  className="lg:col-span-7 lg:pt-[4.5rem] space-y-5"
                >
                  {route.paragraphs.map((p) => (
                    <p
                      key={p}
                      className="t-body text-gray-600 dark:text-[#A3B3A9] max-w-[64ch]"
                    >
                      <Copy text={p} />
                    </p>
                  ))}
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
