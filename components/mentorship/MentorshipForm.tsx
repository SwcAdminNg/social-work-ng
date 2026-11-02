import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import EnquiryForm from "@/components/shared/EnquiryForm";
import { becomeMentor, form } from "./content";

/**
 * "Become a Mentor" and why mentorship matters on the left; the
 * enquiry form, used by mentees and mentors alike, on a card to the
 * right of the deep-green closing chapter.
 */
export function MentorshipForm() {
  return (
    <section
      id="mentor-form"
      aria-labelledby="mentor-heading"
      className="relative bg-[#0c2a1e] text-white rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20 overflow-hidden"
    >
      <div
        className="absolute -top-32 left-[-10%] w-[34rem] h-[34rem] rounded-full bg-[#EBA937]/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="relative max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-12 lg:gap-16 items-start">
        <div>
          <SectionHeading
            id="mentor-heading"
            eyebrow={becomeMentor.eyebrow}
            title={becomeMentor.title}
            tone="dark"
          >
            {becomeMentor.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </SectionHeading>
          <Reveal delay={0.15}>
            <div className="mt-10 rounded-[24px] bg-white/[0.05] ring-1 ring-white/10 p-6 md:p-7">
              <h3 className="text-[1.1rem] font-bold">{becomeMentor.whyTitle}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-white/70">{becomeMentor.why}</p>
            </div>
          </Reveal>
        </div>

        <Reveal from="up" delay={0.1}>
          <EnquiryForm config={form} />
        </Reveal>
      </div>
    </section>
  );
}
