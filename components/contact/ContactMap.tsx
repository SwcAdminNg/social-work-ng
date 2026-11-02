import SectionHeading from "@/components/home/SectionHeading";
import { Reveal } from "@/components/home/motion";
import { location } from "./content";

// Where we are: a short note and the map in a rounded frame on the
// mint sheet.
export function ContactMap() {
  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="relative bg-[#EEF5F1] dark:bg-[#101B15] rounded-t-[40px] md:rounded-t-[56px] -mt-10 pt-24 pb-24 md:pt-32 md:pb-32 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              id="location-heading"
              eyebrow={location.eyebrow}
              title={location.title}
            />
          </div>
          <div className="lg:col-span-7 lg:pt-3">
            <Reveal>
              <p className="t-lead font-normal text-gray-900 dark:text-[#ECF2EE] max-w-[52ch]">
                {location.text}
              </p>
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-12 md:mt-16">
          <div className="relative aspect-[16/10] md:aspect-[21/9] overflow-hidden rounded-[28px] md:rounded-[40px] bg-[#14402F] ring-1 ring-black/5 dark:ring-white/10">
            <iframe
              src={location.mapSrc}
              title="Map showing the Social Work Consultancy Ltd office in Jos"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
