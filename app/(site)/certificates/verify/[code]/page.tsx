import { fetchApi } from "@/lib/fetchApi";
import { Award, CheckCircle2, Download, XCircle } from "lucide-react";

type VerifyResult = {
  valid: boolean;
  recipient_name?: string;
  course_title?: string;
  certificate_number?: string;
  issued_at?: string;
  pdf_url?: string;
};

export const metadata = {
  title: "Verify Certificate | Social Work Nigeria",
};

export default async function VerifyCertificatePage(props: {
  params: Promise<{ code: string }>;
}) {
  const params = await props.params;
  const res = await fetchApi(`/certificates/verify/${params.code}`, {
    next: { revalidate: 0 },
  });
  const json = await res.json().catch(() => ({}));
  const result: VerifyResult = json?.data || { valid: false };

  return (
    <div className="w-full min-h-[70vh] bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-8 sm:p-10 text-center">
        <span
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
            result.valid
              ? "bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#52b788]"
              : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {result.valid ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
        </span>

        <h1 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
          {result.valid ? "Certificate is valid" : "Certificate could not be verified"}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {result.valid
            ? "This certificate was issued by Social Work Nigeria and is genuine."
            : "We couldn't find a certificate matching this verification code."}
        </p>

        {result.valid && (
          <div className="mt-8 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-6 text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white dark:bg-gray-900 text-[#2D6A4F] dark:text-[#52b788] border border-gray-100 dark:border-gray-800">
                <Award className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
                  {result.course_title}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Awarded to {result.recipient_name}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[0.65rem] uppercase font-bold text-gray-400 tracking-wider">
                  Certificate No.
                </dt>
                <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {result.certificate_number}
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase font-bold text-gray-400 tracking-wider">
                  Issued
                </dt>
                <dd className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                  {result.issued_at ? formatDate(result.issued_at) : ""}
                </dd>
              </div>
            </dl>

            {result.pdf_url && (
              <a
                href={result.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] dark:bg-[#52b788] px-4 py-2.5 text-sm font-bold text-white dark:text-gray-950 transition hover:bg-[#1B4332] dark:hover:bg-[#74c69d]"
              >
                <Download className="h-4 w-4" />
                Download certificate
              </a>
            )}
          </div>
        )}
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
