import { fetchApi } from "@/lib/fetchApi";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Award,
  BookOpen,
  Camera,
  ChevronLeft,
  ClipboardList,
  Download,
  Hourglass,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { CopyLinkButton } from "@/components/dashboard/certificates/CopyLinkButton";

type Certificate = {
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

type BlockedReason =
  | { kind: "photo"; message: string }
  | { kind: "grading"; message: string }
  | { kind: "below_pass_mark"; message: string; score: number | null; passMark: number | null }
  | { kind: "other"; message: string };

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] dark:bg-[#52b788] px-4 py-2.5 text-sm font-bold text-white dark:text-gray-950 transition hover:bg-[#1B4332] dark:hover:bg-[#74c69d]";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800";

export default async function CertificateDetailPage(props: {
  params: Promise<{ course_id: string }>;
}) {
  const params = await props.params;
  const res = await fetchApi(`/certificates/mine/${params.course_id}`, {
    next: { revalidate: 0 },
  });

  if (res.status === 401) {
    redirect(`/logout?callbackUrl=/dashboard/certificates/${params.course_id}`);
  }

  const json = await res.json().catch(() => ({}));
  const courseHref = `/learn/${params.course_id}`;

  if (res.status === 400) {
    const reason = classifyBlockedReason(typeof json?.message === "string" ? json.message : "");

    if (reason.kind === "photo") {
      const settingsHref = `/dashboard/settings?profile_photo=certificate&callbackUrl=${encodeURIComponent(
        `/dashboard/certificates/${params.course_id}`,
      )}`;

      return (
        <StatusShell
          icon={<Camera className="h-6 w-6" />}
          title="One last step: add a profile photo"
          eyebrow="You passed - congratulations!"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Your certificate is ready to be issued as soon as your profile has a picture. Use a
            clear, professional headshot - the photo saved at the moment of issue is printed on
            the PDF and stays part of its long-term verification record.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md">
            Once you&apos;ve uploaded it you&apos;ll be brought straight back here and your
            certificate will be issued.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href={settingsHref} className={primaryButton}>
              <Camera className="h-4 w-4" />
              Add profile photo
            </Link>
          </div>
        </StatusShell>
      );
    }

    if (reason.kind === "grading") {
      return (
        <StatusShell
          icon={<Hourglass className="h-6 w-6" />}
          title="Your certificate is on its way"
          eyebrow="Course complete"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            You&apos;ve finished every item in this course. Some of your work - usually an essay -
            is still waiting for its grade to be released. Your overall score can&apos;t be
            worked out until then.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            There&apos;s nothing else you need to do. If you reach the pass mark, your
            certificate is issued automatically as soon as grading is done.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/dashboard/assessments" className={primaryButton}>
              <ClipboardList className="h-4 w-4" />
              View my assessments
            </Link>
            <Link href={courseHref} className={secondaryButton}>
              <BookOpen className="h-4 w-4" />
              Back to course
            </Link>
          </div>
        </StatusShell>
      );
    }

    if (reason.kind === "below_pass_mark") {
      const { score, passMark } = reason;
      const gap = score !== null && passMark !== null ? Math.max(passMark - score, 0) : null;

      return (
        <StatusShell
          icon={<TrendingUp className="h-6 w-6" />}
          title="Not quite at the pass mark yet"
          eyebrow="Course complete"
          tone="amber"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Certificates are awarded when your overall score - the average of your best score
            on every assessment in the course - reaches the course&apos;s pass mark.
          </p>

          {score !== null && passMark !== null ? (
            <ScoreMeter score={score} passMark={passMark} />
          ) : (
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-md">
              {reason.message}
            </p>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            {gap !== null && gap > 0 ? (
              <>
                You need <strong className="text-gray-900 dark:text-white">{formatPercent(gap)} more</strong>{" "}
                to qualify.{" "}
              </>
            ) : null}
            Only your best attempt on each assessment counts, so if retakes are available,
            improving any score raises your overall result - and the certificate is issued as
            soon as you cross the line.
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            <Link href={courseHref} className={primaryButton}>
              <BookOpen className="h-4 w-4" />
              Review the course
            </Link>
            <Link href="/dashboard/assessments" className={secondaryButton}>
              <ClipboardList className="h-4 w-4" />
              View my scores
            </Link>
          </div>
        </StatusShell>
      );
    }

    return (
      <StatusShell
        icon={<Award className="h-6 w-6" />}
        title="This certificate can't be issued yet"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          {reason.message || "Something is still outstanding before this certificate can be issued."}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={courseHref} className={secondaryButton}>
            <BookOpen className="h-4 w-4" />
            Back to course
          </Link>
        </div>
      </StatusShell>
    );
  }

  if (res.status === 404) {
    return (
      <StatusShell
        icon={<Award className="h-6 w-6" />}
        title="No certificate for this course yet"
        tone="neutral"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Complete every item in the course and reach its overall pass mark, and your
          certificate will be issued automatically.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md">
          Scheduled (cohort) courses issue certificates on the course&apos;s official end date,
          even if you finish early - it&apos;ll appear here on its own once that date arrives.
          Some courses don&apos;t offer a certificate at all.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={courseHref} className={primaryButton}>
            <BookOpen className="h-4 w-4" />
            Continue course
          </Link>
        </div>
      </StatusShell>
    );
  }

  if (!res.ok || !json?.data) {
    return (
      <div className="w-full h-full max-w-8xl mx-auto py-8">
        <BackLink />
        <div className="mt-8 p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400">
          <p className="font-semibold text-sm">
            {json?.message || "Unable to load this certificate right now."}
          </p>
        </div>
      </div>
    );
  }

  const cert = json.data as Certificate;

  return (
    <div className="w-full h-full max-w-8xl mx-auto py-8">
      <BackLink />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
          <div className="aspect-[1.414/1] w-full bg-gray-100 dark:bg-gray-950">
            <iframe src={cert.pdf_url} className="w-full h-full border-0" title="Certificate preview" />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2D6A4F]/10 dark:bg-[#52b788]/15 text-[#2D6A4F] dark:text-[#52b788] mb-4">
              <Award className="h-6 w-6" />
            </span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
              {cert.course_title}
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              Issued to {cert.recipient_name}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-5">
              <div>
                <dt className="text-[0.65rem] uppercase font-bold text-gray-400 tracking-wider">
                  Certificate No.
                </dt>
                <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {cert.certificate_number}
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase font-bold text-gray-400 tracking-wider">
                  Issued
                </dt>
                <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {formatDate(cert.issued_at)}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href={cert.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className={primaryButton}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
              <CopyLinkButton value={cert.verify_url} label="Copy verify link" />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-[#2D6A4F] dark:text-[#52b788] mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Publicly verifiable
                </h2>
                <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                  Share the verify link on a resume or LinkedIn - anyone can confirm
                  this certificate is genuine without needing to log in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/dashboard/certificates"
      className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#2D6A4F] dark:hover:text-[#52b788] transition"
    >
      <ChevronLeft className="h-4 w-4" />
      Back to certificates
    </Link>
  );
}

function StatusShell({
  icon,
  title,
  eyebrow,
  tone = "green",
  children,
}: {
  icon: ReactNode;
  title: string;
  eyebrow?: string;
  tone?: "green" | "amber" | "neutral";
  children: ReactNode;
}) {
  const border =
    tone === "neutral"
      ? "border-gray-300 dark:border-gray-700"
      : tone === "amber"
        ? "border-amber-200 dark:border-amber-900/50"
        : "border-[#b7e4c7] dark:border-[#2f6f55]";
  const iconTone =
    tone === "amber"
      ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
      : "bg-[#2D6A4F]/10 dark:bg-[#52b788]/15 text-[#2D6A4F] dark:text-[#52b788]";

  return (
    <div className="w-full h-full max-w-8xl mx-auto py-8">
      <BackLink />

      <div
        className={`mt-8 flex flex-col items-center justify-center text-center gap-4 rounded-2xl bg-white dark:bg-gray-900 border border-dashed ${border} p-10 sm:p-16`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconTone}`}>
          {icon}
        </div>
        <div>
          {eyebrow && (
            <p className="text-[0.65rem] uppercase font-bold tracking-wider text-[#2D6A4F] dark:text-[#52b788]">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-1 text-base font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}

function ScoreMeter({ score, passMark }: { score: number; passMark: number }) {
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const clampedPass = Math.min(Math.max(passMark, 0), 100);

  return (
    <div className="w-full max-w-md text-left">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] uppercase font-bold text-gray-400 tracking-wider">
            Your overall score
          </p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {formatPercent(score)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.65rem] uppercase font-bold text-gray-400 tracking-wider">
            Pass mark
          </p>
          <p className="text-2xl font-extrabold text-[#2D6A4F] dark:text-[#52b788]">
            {formatPercent(passMark)}
          </p>
        </div>
      </div>
      <div
        className="relative mt-3 h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800"
        role="img"
        aria-label={`Overall score ${formatPercent(score)} out of a required ${formatPercent(passMark)}`}
      >
        <div
          className="h-full rounded-full bg-amber-500 dark:bg-amber-400"
          style={{ width: `${clampedScore}%` }}
        />
        <div
          className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-[#2D6A4F] dark:bg-[#52b788]"
          style={{ left: `calc(${clampedPass}% - 1px)` }}
        />
      </div>
    </div>
  );
}

// The API reports why a completed course has no certificate only through the 400
// message, so classify it here to show the student the right next step.
function classifyBlockedReason(message: string): BlockedReason {
  const normalized = message.toLowerCase();
  if (normalized.includes("profile picture")) return { kind: "photo", message };
  if (normalized.includes("graded")) return { kind: "grading", message };
  if (normalized.includes("pass mark")) {
    const match = message.match(/score of ([\d.]+)%.*pass mark of ([\d.]+)%/i);
    return {
      kind: "below_pass_mark",
      message,
      score: match ? Number(match[1]) : null,
      passMark: match ? Number(match[2]) : null,
    };
  }
  return { kind: "other", message };
}

function formatPercent(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
