"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Award, Check, ChevronLeft, ChevronRight, Compass, Download, Info, Share } from "lucide-react";

export type Certificate = {
  id: string;
  course_id: string;
  course_title: string;
  recipient_name: string;
  certificate_number: string;
  verification_code: string;
  issued_at: string;
  pdf_url: string;
  verify_url: string;
};

/** Each pass takes one of these finishes in turn, the way Wallet passes differ by card. */
const FINISHES = ["forest", "teal", "plum", "night"] as const;

export default function CertificatesList({
  initialData,
  totalItems,
  currentPage,
  limit,
  error,
}: {
  initialData: Certificate[];
  totalItems: number;
  currentPage: number;
  limit: number;
  error: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const total = totalItems || initialData.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col pb-8">
      <header className="lms-rise flex flex-col gap-4 pt-1 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="sw-display m-0 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.02] text-ink">Certificates</h1>
          <p className="m-0 mt-2 max-w-2xl text-[0.98rem] text-ink-2">
            {total > 0
              ? `${total} earned. Download the PDF or share a link anyone can use to verify it.`
              : "Certificates you earn by completing courses are kept here, ready to download and share."}
          </p>
        </div>
      </header>

      {error ? (
        <p role="alert" className="m-0 mt-6 rounded-[18px] bg-clay-wash px-5 py-3.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]">
          {error}
        </p>
      ) : initialData.length === 0 ? (
        <div className="lms-milk lms-rise mt-6 flex flex-col items-center px-6 py-14 text-center sm:py-20">
          <div className="lms-pass lms-pass--forest lms-pass--ghost" aria-hidden="true">
            <span className="lms-pass-seal">
              <Award className="h-5 w-5" strokeWidth={2} />
            </span>
          </div>
          <h2 className="m-0 mt-6 text-[1.25rem] font-bold tracking-[-0.02em] text-ink">No certificates yet</h2>
          <p className="m-0 mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-2">
            Finish a course and reach its overall pass mark, the average of your best score on each assessment, and
            your certificate appears here automatically. Scheduled and cohort courses issue theirs on the course’s
            official end date.
          </p>
          <Link href="/dashboard/courses" className="lms-btn mt-6">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Go to my courses
          </Link>
        </div>
      ) : (
        <>
          <ul className="lms-pass-grid m-0 mt-6 list-none p-0">
            {initialData.map((cert, index) => (
              <li key={cert.id} className="lms-rise min-w-0" style={{ "--i": Math.min(index, 6) } as React.CSSProperties}>
                <CertificatePass cert={cert} finish={FINISHES[((currentPage - 1) * limit + index) % FINISHES.length]} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="m-0 text-sm text-ink-3">
                {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, total)} of {total}
              </p>
              <nav className="lms-pager" aria-label="Certificate pages">
                <button type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page" className="lms-page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="lms-page" aria-current="page">
                  {currentPage}
                </span>
                <span className="px-1 text-sm text-ink-3">of {totalPages}</span>
                <button type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} aria-label="Next page" className="lms-page">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CertificatePass({ cert, finish }: { cert: Certificate; finish: (typeof FINISHES)[number] }) {
  const [shared, setShared] = useState(false);

  async function share() {
    const data = { title: `${cert.course_title} certificate`, text: `Verify my certificate for ${cert.course_title}`, url: cert.verify_url };
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(cert.verify_url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      // The share sheet was dismissed, or the clipboard is unavailable.
    }
  }

  return (
    <article className="flex flex-col gap-3">
      <Link
        href={`/dashboard/certificates/${cert.course_id}`}
        aria-label={`${cert.course_title} certificate, issued ${formatDate(cert.issued_at)}`}
        className={`lms-pass lms-pass--${finish}`}
      >
        <span className="lms-pass-sheen" aria-hidden="true" />
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-[0.66rem] font-semibold uppercase tracking-[0.16em] opacity-70">Certificate of completion</span>
            <span className="mt-0.5 block text-[0.78rem] font-medium opacity-85">Social Work Consultancy</span>
          </span>
          <span className="lms-pass-seal" aria-hidden="true">
            <Award className="h-5 w-5" strokeWidth={2} />
          </span>
        </span>

        <span className="sw-title mt-auto line-clamp-2 block pt-6 text-[1.3rem] leading-[1.15] tracking-[-0.02em] sm:text-[1.4rem]">
          {cert.course_title}
        </span>

        <span className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 border-t border-white/15 pt-3">
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] opacity-60">Awarded to</span>
          <span className="text-right text-[0.62rem] font-semibold uppercase tracking-[0.12em] opacity-60">Issued</span>
          <span className="truncate text-[0.88rem] font-semibold">{cert.recipient_name}</span>
          <span className="text-right text-[0.88rem] font-semibold tabular-nums">{formatDate(cert.issued_at)}</span>
        </span>
        <span className="mt-2 block truncate font-mono text-[0.7rem] tracking-[0.06em] opacity-60">No. {cert.certificate_number}</span>
      </Link>

      <div className="lms-pass-actions">
        <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer" className="lms-pass-action lms-pass-action--primary">
          <Download className="h-4 w-4" aria-hidden="true" />
          PDF
        </a>
        <button type="button" onClick={share} className="lms-pass-action" aria-live="polite">
          {shared ? <Check className="h-4 w-4" aria-hidden="true" /> : <Share className="h-4 w-4" aria-hidden="true" />}
          {shared ? "Link copied" : "Share"}
        </button>
        <Link href={`/dashboard/certificates/${cert.course_id}`} className="lms-pass-action">
          <Info className="h-4 w-4" aria-hidden="true" />
          Details
        </Link>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" }).format(date);
}
