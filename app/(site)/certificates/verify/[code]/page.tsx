import type { Metadata } from "next";
import Image from "next/image";
import { Award, BadgeCheck, CalendarDays, Download, Hash, SearchX, ShieldCheck, UserRound } from "lucide-react";
import { Btn, Contours, Eyebrow, Heading, type Vars } from "@/components/site/ui";
import { fetchApi } from "@/lib/fetchApi";

type VerifyResult = {
  valid: boolean;
  recipient_name?: string;
  course_title?: string;
  certificate_number?: string;
  issued_at?: string;
  pdf_url?: string;
};

// A certificate page names a person, so it stays out of search results.
export const metadata: Metadata = {
  title: "Verify Certificate | Social Work Nigeria",
  description: "Check that a certificate from Social Work Consultancy Ltd is genuine.",
  robots: { index: false, follow: false },
};

export default async function VerifyCertificatePage(props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  let result: VerifyResult = { valid: false };
  let reachable = true;
  try {
    const res = await fetchApi(`/certificates/verify/${encodeURIComponent(params.code)}`, { next: { revalidate: 0 } });
    const json = await res.json().catch(() => ({}));
    result = json?.data || { valid: false };
    // A code that is not found is an answer; a server fault is not.
    reachable = res.status < 500;
  } catch {
    reachable = false;
  }

  const issued = result.issued_at ? formatDate(result.issued_at) : "";

  return (
    <section
      aria-labelledby="verify-heading"
      data-progress="view"
      className="sw-on-dark sw-grain relative -mt-[var(--nav-h)] overflow-hidden bg-forest pb-24 pt-[var(--nav-h)] md:pb-32"
    >
      <Contours className="text-leaf" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-brand/40 blur-[150px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 h-[400px] w-[400px] rounded-full bg-clay/25 blur-[140px]" />

      <div className="sw-wrap relative grid items-center gap-x-14 gap-y-12 pt-10 md:pt-16 lg:grid-cols-[0.9fr_1.1fr]">
        {/* The answer */}
        <div>
          <div data-reveal>
            <Eyebrow className="text-gold-light">Certificate check</Eyebrow>
          </div>
          {result.valid ? (
            <>
              <Heading
                as="h1"
                id="verify-heading"
                text="This certificate is *genuine*"
                accent="text-gold-light"
                delay={0.35}
                className="sw-display m-0 mt-6 text-[clamp(2.4rem,5vw,4.3rem)] text-[#fffdf4]"
              />
              <p data-reveal style={{ "--d": "0.7s" } as Vars} className="sw-lead m-0 mt-6 max-w-lg text-white/80">
                This certificate was issued by Social Work Nigeria and is genuine. The details on the right come
                straight from our records.
              </p>
            </>
          ) : (
            <>
              <Heading
                as="h1"
                id="verify-heading"
                text={reachable ? "We could not *verify* this certificate" : "We could not *check* this certificate just now"}
                accent="text-gold-light"
                delay={0.35}
                className="sw-display m-0 mt-6 text-[clamp(2.2rem,4.6vw,3.9rem)] text-[#fffdf4]"
              />
              <p data-reveal style={{ "--d": "0.7s" } as Vars} className="sw-lead m-0 mt-6 max-w-lg text-white/80">
                {reachable
                  ? "We couldn't find a certificate matching this verification code. Check that the link or code was copied in full."
                  : "Our records could not be reached. Please try again in a few minutes."}
              </p>
            </>
          )}
          <div data-reveal style={{ "--d": "0.85s" } as Vars} className="mt-9 flex flex-wrap gap-3">
            {result.valid && result.pdf_url ? (
              <a href={result.pdf_url} target="_blank" rel="noopener noreferrer" className="sw-btn sw-btn--gold">
                <span>Download certificate</span>
                <span className="sw-btn-dot" aria-hidden="true">
                  <Download size={16} />
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <Btn href="/contact?topic=account" variant="gold">Contact support</Btn>
            )}
            <Btn href="/courses" variant="ghost">Explore Courses</Btn>
          </div>
          <p data-reveal style={{ "--d": "0.95s" } as Vars} className="m-0 mt-8 flex max-w-md items-start gap-3 text-sm leading-relaxed text-white/60">
            <ShieldCheck size={18} className="mt-0.5 flex-none text-gold-light" aria-hidden="true" />
            Every certificate carries a code that can be checked here. A certificate records completion of a course; it
            does not, in itself, confer professional registration.
          </p>
        </div>

        {/* The certificate */}
        <div data-reveal="scale" style={{ "--d": "0.45s" } as Vars} className="relative mx-auto w-full max-w-[560px]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#fbf8f0] p-7 text-[#0e1f17] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.7)] md:rounded-[40px] md:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-3 rounded-[24px] border border-[#eba937]/50 md:inset-4 md:rounded-[30px]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <Image src="/images/logo/swc-logo-on-light.webp" alt="Social Work Consultancy Ltd" width={480} height={133} className="h-auto w-[150px]" />
                <span
                  className={`sw-chip ${result.valid ? "bg-[#14402f] text-white" : "bg-[#fbe7dc] text-[#b24424]"}`}
                >
                  {result.valid ? <BadgeCheck size={15} className="text-[#f3c56b]" aria-hidden="true" /> : <SearchX size={15} aria-hidden="true" />}
                  {result.valid ? "Verified" : "Not verified"}
                </span>
              </div>

              {result.valid ? (
                <>
                  <p className="sw-cap m-0 mt-10 text-[#8a5a00]">Certificate of completion</p>
                  <p className="sw-display m-0 mt-3 text-[clamp(1.7rem,3.4vw,2.4rem)] leading-[1.05]">{result.course_title}</p>
                  <p className="m-0 mt-6 text-sm text-[#3f5148]">Awarded to</p>
                  <p className="sw-em m-0 mt-1 text-[clamp(2rem,4.4vw,3rem)] leading-none text-[#b24424]">{result.recipient_name}</p>

                  <dl className="m-0 mt-9 grid gap-5 border-t border-[#0e1f17]/12 pt-6 sm:grid-cols-2">
                    <Detail icon={Hash} label="Certificate No.">{result.certificate_number}</Detail>
                    <Detail icon={CalendarDays} label="Issued">{issued}</Detail>
                    <Detail icon={UserRound} label="Awarded to">{result.recipient_name}</Detail>
                    <Detail icon={Award} label="Issued by">Social Work Consultancy Ltd</Detail>
                  </dl>
                </>
              ) : (
                <div className="py-12 text-center">
                  <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#fbe7dc] text-[#b24424]">
                    <SearchX size={34} aria-hidden="true" />
                  </span>
                  <p className="sw-display m-0 mt-6 text-[1.7rem]">No matching certificate</p>
                  <p className="mx-auto m-0 mt-3 max-w-xs text-[0.95rem] leading-relaxed text-[#3f5148]">
                    Code checked: <span className="break-all font-semibold">{params.code}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({ icon: Icon, label, children }: { icon: typeof Award; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#eef5f1] text-[#2d6a4f]">
        <Icon size={17} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="sw-cap text-[#66766d]">{label}</dt>
        <dd className="m-0 mt-1 break-words font-semibold">{children}</dd>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(date);
}
