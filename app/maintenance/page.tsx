import type { Metadata } from "next";
import Image from "next/image";
import { Wrench } from "lucide-react";
import { Contours } from "@/components/site/ui";
import { siteFonts } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Under Maintenance | Social Work Nigeria",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className={`${siteFonts} sw`}>
      <main className="sw-on-dark sw-grain relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-forest px-6 py-16 text-center">
        <Contours className="text-leaf" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-clay/30 blur-[140px]" />

        <div className="relative z-10 max-w-xl">
          <Image
            src="/images/logo/swc-logo-on-dark.webp"
            alt="Social Work Consultancy Ltd"
            width={480}
            height={133}
            className="mx-auto h-auto w-[170px]"
            priority
          />
          <div className="mx-auto mt-12 grid h-20 w-20 place-items-center rounded-full bg-gold text-[#10231a]">
            <Wrench className="h-9 w-9" aria-hidden="true" />
          </div>
          <h1 className="sw-display m-0 mt-8 text-[clamp(2.4rem,6vw,4.2rem)] text-[#fffdf4]">
            We&apos;ll be back <em className="sw-em text-gold-light">soon</em>
          </h1>
          <p className="sw-lead m-0 mt-6 text-white/75">
            Social Work Nigeria is currently undergoing scheduled maintenance. We&apos;re working to get everything
            back up as quickly as possible. Thank you for your patience.
          </p>
        </div>
      </main>
    </div>
  );
}
