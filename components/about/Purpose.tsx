import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { ParallaxImage, Reveal } from "@/components/home/motion";
import { purpose, type Chapter } from "./content";

// Paragraph text with the learning platform's name linked wherever it occurs.
function Copy({ text }: { text: string }) {
  const { platformName, platformHref } = purpose;
  if (!text.includes(platformName)) return <>{text}</>;
  const parts = text.split(platformName);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <Link
              href={platformHref}
              className="font-semibold text-[#F3C56B] underline underline-offset-4 decoration-[#F3C56B]/40 hover:decoration-current rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F3C56B]"
            >
              {platformName}
            </Link>
          )}
        </span>
      ))}
    </>
  );
}

// One strand of the work: a photograph and its explanation, side by side,
// swapping sides down the page. Phones show the picture above the words.
function ChapterRow({ chapter, index }: { chapter: Chapter; index: number }) {
  const flip = index % 2 === 1;
  return (
    <li
      id={`purpose-${chapter.id}`}
      className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center scroll-mt-28"
    >
      <Reveal
        from={flip ? "right" : "left"}
        className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}
      >
        <ParallaxImage
          src={chapter.image}
          alt={chapter.imageAlt}
          strength={6}
          position={chapter.focus}
          className="aspect-[4/3] lg:aspect-[4/5] rounded-[28px] ring-1 ring-white/10"
        />
      </Reveal>
      <div className={`lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
        <Reveal>
          <span className="text-[0.8rem] font-bold tabular-nums text-[#F3C56B]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-3 t-h3 font-bold text-white max-w-[22ch]">
            {chapter.title}
          </h3>
        </Reveal>
        <div className="mt-6 space-y-5 t-body text-white/70 max-w-[60ch]">
          {chapter.paragraphs.map((p, i) => (
            <Reveal key={p} delay={0.06 * (i + 1)}>
              <p>
                <Copy text={p} />
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </li>
  );
}

/**
 * "Why We Exist and How We Work". A deep-green chapter: the purpose in
 * three paragraphs, the four strands of the work as photographic rows,
 * and the invitation to talk, in gold, to close.
 */
export default function Purpose() {
  const [lead, ...rest] = purpose.paragraphs;
  const { invitation } = purpose;

  return (
    <section
      id="purpose"
      aria-labelledby="purpose-heading"
      className="relative bg-[#0c2a1e] text-white rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20 overflow-hidden"
    >
      <div
        className="absolute -top-40 right-[-10%] w-[36rem] h-[36rem] rounded-full bg-[#EBA937]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[32rem] h-[32rem] rounded-full bg-[#52b788]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              id="purpose-heading"
              eyebrow={purpose.eyebrow}
              title={purpose.title}
              tone="dark"
            />
          </div>
          <div className="lg:col-span-7 lg:pt-3">
            <Reveal>
              <p className="t-lead text-white/95 max-w-[58ch]">{lead}</p>
            </Reveal>
            <div className="mt-7 space-y-5 t-body text-white/70 max-w-[64ch]">
              {rest.map((p, i) => (
                <Reveal key={p} delay={0.08 * (i + 1)}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <ol className="mt-20 md:mt-28 space-y-20 md:space-y-28">
          {purpose.chapters.map((chapter, i) => (
            <ChapterRow key={chapter.id} chapter={chapter} index={i} />
          ))}
        </ol>

        <Reveal className="mt-20 md:mt-28">
          <div className="rounded-[32px] md:rounded-[40px] bg-[#EBA937] text-[#10291E] p-8 md:p-12 lg:p-14 grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            <div className="lg:col-span-8">
              <p className="flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-[#10291E]/70">
                <span className="h-px w-8 bg-current" aria-hidden="true" />
                {invitation.label}
              </p>
              <h3 className="mt-5 t-h2 font-bold">{invitation.title}</h3>
              <div className="mt-5 space-y-4 t-body text-[#10291E]/80 max-w-[60ch]">
                {invitation.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <Link
                href={invitation.button.href}
                className="group inline-flex items-center justify-center gap-2 min-h-[54px] px-8 bg-[#14402F] text-white text-[1rem] font-bold rounded-full shadow-[0_12px_30px_-12px_rgba(16,41,30,0.6)] hover:bg-[#0c2a1e] active:scale-[0.97] transition-[background-color,scale] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#10291E]/40"
              >
                {invitation.button.label}
                <ArrowRight
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
