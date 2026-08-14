"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, FileText, Upload } from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";

type EssaySubmissionValue = {
  content_text?: string | null;
  document_file_name?: string | null;
  document_download_url?: string | null;
  submitted_at?: string | null;
  is_graded?: boolean | null;
  is_published?: boolean | null;
  score?: number | null;
  feedback?: string | null;
};

type EssaySubmissionProps = {
  courseId: string;
  itemId: string;
  essayQuestion?: string | null;
  essayDescription?: string | null;
  submissionMode?: "TEXT" | "DOCUMENT" | string | null;
  dueDate?: string | null;
  submission?: EssaySubmissionValue | null;
};

export function EssaySubmission({
  courseId,
  itemId,
  essayQuestion,
  essayDescription,
  submissionMode,
  dueDate,
  submission,
}: EssaySubmissionProps) {
  const router = useRouter();
  const mode = submissionMode === "DOCUMENT" ? "DOCUMENT" : "TEXT";
  const [currentTime] = useState(() => Date.now());
  const [contentText, setContentText] = useState(submission?.content_text || "");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const deadline = dueDate ? new Date(dueDate) : null;
  const deadlinePassed = deadline ? deadline.getTime() < currentTime : false;
  const isGraded = submission?.is_graded === true;
  const canSubmit = !isGraded && !deadlinePassed;
  const hasSubmission = Boolean(submission?.submitted_at);

  const handleTextSubmit = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/proxy/learning/courses/${courseId}/items/${itemId}/essay/submit-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_text: contentText }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.message || "Failed to submit essay");

      setSuccess(data.message || "Essay submitted successfully");
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to submit essay"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentSubmit = async () => {
    if (!file) {
      setError("Choose a document before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const uploadUrlRes = await fetch(`/api/proxy/learning/courses/${courseId}/items/${itemId}/essay/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_name: file.name }),
      });
      const uploadUrlData = await uploadUrlRes.json().catch(() => ({}));

      if (!uploadUrlRes.ok) {
        throw new Error(uploadUrlData.message || "Failed to prepare document upload");
      }

      const uploadUrl = uploadUrlData.data?.upload_url;
      const storageKey = uploadUrlData.data?.storage_key;

      if (!uploadUrl || !storageKey) {
        throw new Error("The upload URL response was incomplete.");
      }

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: file.type ? { "Content-Type": file.type } : undefined,
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload document.");
      }

      const submitRes = await fetch(`/api/proxy/learning/courses/${courseId}/items/${itemId}/essay/submit-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storage_key: storageKey,
          file_name: file.name,
          mime_type: file.type || undefined,
        }),
      });
      const submitData = await submitRes.json().catch(() => ({}));

      if (!submitRes.ok) {
        throw new Error(submitData.message || "Failed to submit document");
      }

      setFile(null);
      setSuccess(submitData.message || "Document submitted successfully");
      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to submit document"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-10">
        <div className="mb-6 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <span>{mode === "DOCUMENT" ? "Document upload" : "Text response"}</span>
          {deadline && <span>Due {deadline.toLocaleDateString()}</span>}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {essayQuestion || "Essay Assignment"}
        </h2>
        {essayDescription && (
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-600 dark:text-gray-300">
            {essayDescription}
          </p>
        )}
      </section>

      {hasSubmission && (
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] dark:bg-[#52b788]/10 dark:text-[#52b788]">
              <CheckCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {submission?.is_published
                  ? "Grade published"
                  : isGraded
                    ? "Instructor review complete"
                    : "Submitted, awaiting review"}
              </h3>
              {submission?.submitted_at && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Submitted {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }).format(new Date(submission.submitted_at))}
                </p>
              )}

              {submission?.is_published && typeof submission.score === "number" && (
                <p className="mt-4 text-lg font-extrabold text-gray-900 dark:text-white">
                  Score: {submission.score}
                </p>
              )}
              {submission?.is_published && submission.feedback && (
                <p className="mt-3 whitespace-pre-line rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:bg-gray-800/60 dark:text-gray-200">
                  {submission.feedback}
                </p>
              )}
              {isGraded && !submission?.is_published && (
                <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                  Your instructor has reviewed this essay. The grade has not been published yet.
                </p>
              )}
              {!isGraded && (
                <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                  You can resubmit until this essay is graded or the deadline passes.
                </p>
              )}

              {submission?.document_download_url && (
                <a
                  href={submission.document_download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#b7e4c7] px-4 py-2 text-sm font-bold text-[#2D6A4F] transition hover:bg-[#f0fbf5] dark:border-[#27433a] dark:text-[#b7e4c7] dark:hover:bg-[#183026]"
                >
                  <FileText className="h-4 w-4" />
                  {submission.document_file_name || "Download submission"}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {hasSubmission ? "Resubmit essay" : "Submit essay"}
        </h3>

        {mode === "TEXT" ? (
          <textarea
            value={contentText}
            onChange={(event) => setContentText(event.target.value)}
            disabled={!canSubmit || submitting}
            rows={12}
            className="mt-5 w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-900 outline-none transition focus:border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-[#52b788] dark:focus:ring-[#52b788]/10 dark:disabled:bg-gray-900"
            placeholder="Write your response here..."
          />
        ) : (
          <label className={`mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
            canSubmit
              ? "border-[#b7e4c7] bg-[#f7fcf9] hover:bg-[#eef8f2] dark:border-[#27433a] dark:bg-[#13231d] dark:hover:bg-[#183026]"
              : "cursor-not-allowed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
          }`}>
            <Upload className="mb-3 h-8 w-8 text-[#2D6A4F] dark:text-[#52b788]" />
            <span className="font-bold text-gray-900 dark:text-white">
              {file ? file.name : "Choose essay document"}
            </span>
            <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload the final file, then submit it for review.
            </span>
            <input
              type="file"
              disabled={!canSubmit || submitting}
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="sr-only"
            />
          </label>
        )}

        {error && <p className="mt-4 text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>}
        {success && <p className="mt-4 text-sm font-semibold text-[#2D6A4F] dark:text-[#52b788]">{success}</p>}
        {!canSubmit && (
          <p className="mt-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
            {deadlinePassed
              ? "The deadline for this essay has passed."
              : "This essay has been graded and can no longer be resubmitted."}
          </p>
        )}

        <button
          onClick={mode === "TEXT" ? handleTextSubmit : handleDocumentSubmit}
          disabled={!canSubmit || submitting || (mode === "TEXT" && contentText.trim().length === 0)}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] px-6 text-sm font-bold text-white shadow-lg shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#52b788] dark:text-gray-950 dark:hover:bg-[#40916c] sm:w-auto"
        >
          {submitting ? <IconSpinner className="h-5 w-5 animate-spin" /> : null}
          {submitting ? "Submitting..." : hasSubmission ? "Resubmit" : "Submit"}
        </button>
      </section>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
