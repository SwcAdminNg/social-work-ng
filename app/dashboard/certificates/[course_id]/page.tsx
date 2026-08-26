import { fetchApi } from "@/lib/fetchApi";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, Camera, ChevronLeft, Download, ShieldCheck } from "lucide-react";
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

  if (res.status === 400) {
    const settingsHref = `/dashboard/settings?profile_photo=certificate&callbackUrl=${encodeURIComponent(
      `/dashboard/certificates/${params.course_id}`,
    )}`;

    return (
      <div className="w-full h-full max-w-8xl mx-auto py-8">
        <Link
          href="/dashboard/certificates"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#2D6A4F] dark:hover:text-[#52b788] transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to certificates
        </Link>

        <div className="mt-8 flex flex-col items-center justify-center text-center gap-4 rounded-2xl bg-white dark:bg-gray-900 border border-dashed border-[#b7e4c7] dark:border-[#2f6f55] p-10 sm:p-16">
          <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F]/10 dark:bg-[#52b788]/15 text-[#2D6A4F] dark:text-[#52b788] flex items-center justify-center">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Add a profile photo to issue this certificate
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
              {json?.message ||
                "Add a profile picture to your profile before this certificate can be issued."}{" "}
              Use a clear, professional headshot because the photo saved when
              the certificate is issued will appear on the PDF and remain part
              of its long-term verification record.
            </p>
          </div>
          <Link
            href={settingsHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] dark:bg-[#52b788] px-4 py-2.5 text-sm font-bold text-white dark:text-gray-950 transition hover:bg-[#1B4332] dark:hover:bg-[#74c69d]"
          >
            <Camera className="h-4 w-4" />
            Add profile photo
          </Link>
        </div>
      </div>
    );
  }

  if (res.status === 404) {
    return (
      <div className="w-full h-full max-w-8xl mx-auto py-8">
        <Link
          href="/dashboard/certificates"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#2D6A4F] dark:hover:text-[#52b788] transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to certificates
        </Link>

        <div className="mt-8 flex flex-col items-center justify-center text-center gap-3 rounded-2xl bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 p-10 sm:p-16">
          <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F]/10 dark:bg-[#52b788]/15 text-[#2D6A4F] dark:text-[#52b788] flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            No certificate for this course yet
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            Complete every item in the course - including passing any final assessments -
            and your certificate will be issued automatically. If this is a scheduled
            (cohort) course, the certificate isn&apos;t issued until the course&apos;s
            official end date, even if you finished early - it&apos;ll appear here on
            its own once that date arrives.
          </p>
        </div>
      </div>
    );
  }

  if (!res.ok || !json?.data) {
    return (
      <div className="w-full h-full max-w-8xl mx-auto py-8">
        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400">
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
      <Link
        href="/dashboard/certificates"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-[#2D6A4F] dark:hover:text-[#52b788] transition"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to certificates
      </Link>

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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] dark:bg-[#52b788] px-4 py-2.5 text-sm font-bold text-white dark:text-gray-950 transition hover:bg-[#1B4332] dark:hover:bg-[#74c69d]"
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
