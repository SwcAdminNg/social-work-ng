import {
  Eyebrow,
  ParallaxImage,
  Reveal,
  WordReveal,
} from "@/components/home/motion";
import { banner } from "./content";

/**
 * The two-column opening banner: the invitation in large type on the
 * left, the introduction on the right, over the photograph of three
 * representatives reviewing a folder. A deep green wash keeps both
 * columns readable; the picture is decorative and the meaning stays in
 * the text. The header reads its colours from this section.
 */
export default function PartnerBanner() {
  const [first, ...rest] = banner.paragraphs;

  return (
    <section
      aria-labelledby="partner-heading"
      data-nav-bg="rgba(12, 42, 30, 0.55)"
      data-nav-theme="dark"
      className="relative -mt-[84px] bg-[#0c2a1e] text-white overflow-hidden pt-[calc(84px+4.5rem)] pb-28 md:pt-[calc(84px+7rem)] md:pb-36"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <ParallaxImage
          src={banner.image}
          alt=""
          loading="eager"
          strength={5}
          position="60% 30%"
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c2a1e] via-[#0c2a1e]/90 to-[#0c2a1e]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c2a1e] via-transparent to-[#0c2a1e]/50" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <div className="lg:col-span-6">
          <Reveal from="none">
            <Eyebrow tone="gold" className="mb-6">
              {banner.eyebrow}
            </Eyebrow>
          </Reveal>
          <h1 id="partner-heading" className="t-display font-bold text-white">
            <WordReveal text={banner.titleLead} />{" "}
            <span className="text-[#F3C56B]">
              <WordReveal text={banner.titleAccent} delay={0.18} />
            </span>
            <span className="text-[#EBA937]" aria-hidden="true">
              .
            </span>
          </h1>
        </div>
        <div className="lg:col-span-6 lg:pt-3 lg:pl-12 lg:border-l lg:border-white/15">
          <Reveal delay={0.25}>
            <p className="t-lead text-white max-w-[52ch]">{first}</p>
          </Reveal>
          <div className="mt-6 space-y-5">
            {rest.map((p, i) => (
              <Reveal key={p} delay={0.32 + i * 0.08}>
                <p className="t-body text-white/75 max-w-[58ch]">{p}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
