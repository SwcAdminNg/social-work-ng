import { ArrowUpRight, Info, Mail } from "lucide-react";
import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { conversation, process } from "./content";

/**
 * "How We Build a Partnership", in the place the old past-partnerships
 * text occupied: the opening line, then the four stages as numbered
 * tiles. The chapter closes with the invitation to start a conversation
 * as a gold tile: the address in plain, copyable text and a mail link
 * that opens a message with the agreed subject.
 */
export default function Process() {
  const mailto = `mailto:${conversation.email}?subject=${encodeURIComponent(conversation.emailSubject)}`;

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="relative bg-[#0c2a1e] text-white rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20 overflow-hidden"
    >
      <div
        className="absolute -top-40 right-[-12%] w-[38rem] h-[38rem] rounded-full bg-[#EBA937]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-[-10%] w-[30rem] h-[30rem] rounded-full bg-[#2D6A4F]/30 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              id="process-heading"
              eyebrow={process.eyebrow}
              title={process.title}
              tone="dark"
            />
          </div>
          <div className="lg:col-span-7 lg:pt-3">
            <Reveal>
              <p className="t-lead text-white max-w-[52ch]">{process.lead}</p>
            </Reveal>
          </div>
        </div>

        <ol className="mt-14 md:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {process.steps.map((step, i) => (
            <li key={step.title} className="flex">
              <Reveal delay={0.06 * i} className="flex w-full">
                <article className="flex flex-col w-full rounded-[28px] bg-white/[0.05] ring-1 ring-white/10 p-7 md:p-8">
                  <span
                    className="text-[0.78rem] font-bold tracking-[0.18em] text-[#F3C56B]"
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-[1.15rem] font-bold leading-snug tracking-[-0.01em] text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-white/65">
                    {step.text}
                  </p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-14 md:mt-20">
          <div
            id="conversation"
            className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-[#EBA937] text-[#10291E] p-8 md:p-12 lg:p-14 scroll-mt-28"
          >
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/20 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-14">
              <div className="lg:col-span-7">
                <h3 className="t-h2 font-bold">{conversation.title}</h3>
                <div className="mt-5 space-y-4">
                  {conversation.paragraphs.map((p) => (
                    <p key={p} className="t-body text-[#10291E]/80 max-w-[60ch]">
                      {p}
                    </p>
                  ))}
                </div>
                <p className="mt-6 flex gap-2.5 text-[0.9rem] leading-relaxed text-[#10291E]/75 max-w-[60ch]">
                  <Info className="w-4 h-4 mt-1 shrink-0" aria-hidden="true" />
                  {conversation.notice}
                </p>
              </div>
              <div className="lg:col-span-5 flex flex-col justify-end gap-5">
                <div className="rounded-[24px] bg-[#10291E]/[0.08] ring-1 ring-[#10291E]/10 p-5 md:p-6">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#10291E]/60">
                    Email
                  </p>
                  <p className="mt-2 flex items-center gap-2.5 text-[0.95rem] sm:text-[1.05rem] font-bold [overflow-wrap:anywhere] select-all">
                    <Mail className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
                    {conversation.email}
                  </p>
                  <a
                    href={mailto}
                    className="group mt-5 inline-flex items-center justify-center gap-2.5 w-full min-h-[54px] px-7 rounded-full bg-[#14402F] text-white text-[0.95rem] font-bold hover:bg-[#0c2a1e] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#14402F]/40"
                  >
                    {conversation.linkLabel}
                    <ArrowUpRight
                      className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </div>
                <p className="text-[0.85rem] leading-relaxed text-[#10291E]/70">
                  {conversation.disclaimer}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
