import SectionHeading from "@/components/home/SectionHeading";
import { ParallaxImage, Reveal } from "@/components/home/motion";
import { audiences } from "./content";

/**
 * "Who Our Learning Supports". The four audiences as photographic
 * tiles on the mint sheet, drawn from the SWCL picture set: two by two
 * from tablets up, stacked on phones, with the note about course
 * descriptions beneath.
 */
export default function Audiences() {
  return (
    <section
      id="audiences"
      aria-labelledby="audiences-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              id="audiences-heading"
              eyebrow={audiences.eyebrow}
              title={audiences.title}
            />
          </div>
          <div className="lg:col-span-7 lg:pt-3">
            <Reveal>
              <p className="t-lead font-normal text-gray-900 dark:text-[#ECF2EE] max-w-[52ch]">
                {audiences.intro}
              </p>
            </Reveal>
          </div>
        </div>

        <ul className="mt-14 md:mt-16 grid sm:grid-cols-2 gap-4 md:gap-5">
          {audiences.items.map((item, i) => (
            <li key={item.id} id={`audience-${item.id}`} className="flex scroll-mt-28">
              <Reveal delay={0.05 * (i % 2)} className="flex w-full">
                <article className="flex flex-col w-full overflow-hidden rounded-[28px] bg-white dark:bg-[#16231C] ring-1 ring-black/5 dark:ring-white/10">
                  <ParallaxImage
                    src={item.image}
                    alt={item.imageAlt}
                    strength={5}
                    position={item.focus}
                    className="aspect-[16/10]"
                  />
                  <div className="p-7 md:p-8">
                    <h3 className="text-[1.15rem] md:text-[1.2rem] font-bold leading-snug tracking-[-0.01em] text-gray-900 dark:text-[#ECF2EE]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[0.98rem] leading-relaxed text-gray-600 dark:text-[#A3B3A9]">
                      {item.text}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={0.1}>
          <p className="mt-10 md:mt-12 t-body text-gray-600 dark:text-[#A3B3A9] max-w-[64ch]">
            {audiences.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
