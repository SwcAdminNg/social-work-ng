"use client";

import { ConfirmSubmitDialog } from "./ConfirmSubmitDialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, FileText, Send, Upload, XCircle } from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
import { FinalAssessmentNotice, MetaPills, formatDue } from "./AssessmentParts";

type EssaySubmissionValue = {
  content_text?: string | null;
  document_file_name?: string | null;
  document_download_url?: string | null;
  submitted_at?: string | null;
  is_graded?: boolean | null;
  is_published?: boolean | null;
  result_status?: string | null;
  score?: number | null;
  feedback?: string | null;
  passed?: boolean | null;
};

type EssaySubmissionProps = {
  courseId: string;
  itemId: string;
  essayQuestion?: string | null;
  essayDescription?: string | null;
  estimatedMinutes?: number | null;
  submissionMode?: "TEXT" | "DOCUMENT" | string | null;
  dueDate?: string | null;
  submission?: EssaySubmissionValue | null;
  isFinalAssessment?: boolean | null;
  maxAttempts?: number | null;
  attemptsUsed?: number | null;
  attemptsRemaining?: number | null;
  passMarkPercentage?: number | null;
  isLastSection?: boolean;
};

export function EssaySubmission({
  courseId,
  itemId,
  essayQuestion,
  essayDescription,
  submissionMode,
  dueDate,
  submission,
  isFinalAssessment,
  maxAttempts,
  attemptsUsed,
  attemptsRemaining,
  passMarkPercentage,
  isLastSection,
}: EssaySubmissionProps) {
  const router = useRouter();
  const mode = submissionMode === "DOCUMENT" ? "DOCUMENT" : "TEXT";
  const [currentTime] = useState(() => Date.now());
  const [contentText, setContentText] = useState(submission?.content_text || "");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [markingLockedMessage, setMarkingLockedMessage] = useState("");

  const deadline = dueDate ? new Date(dueDate) : null;
  const deadlinePassed = deadline ? deadline.getTime() < currentTime : false;
  const isGraded = submission?.is_graded === true;
  const hasSubmission = Boolean(submission?.submitted_at);
  const resultStatus = submission?.result_status?.toUpperCase();
  const isBeingMarked = hasSubmission && isMarkInProgressStatus(resultStatus);
  const isAwaitingModeratedResult = Boolean(
    hasSubmission && !isGraded && (isFinalAssessment || isBeingMarked),
  );
  const canSubmit =
    !isGraded &&
    !deadlinePassed &&
    !isAwaitingModeratedResult &&
    !isBeingMarked &&
    !markingLockedMessage;

  const handleTextSubmit = async () => {
    setSubmitting(true);
    setError("");
    setSuccess("");
    setMarkingLockedMessage("");

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
      const message = getErrorMessage(err, "Failed to submit essay");
      if (isBeingMarkedMessage(message)) setMarkingLockedMessage(message);
      setError(message);
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
    setMarkingLockedMessage("");

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
      const message = getErrorMessage(err, "Failed to submit document");
      if (isBeingMarkedMessage(message)) setMarkingLockedMessage(message);
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const attemptsLabel =
    typeof attemptsRemaining === "number"
      ? `${attemptsRemaining} ${attemptsRemaining === 1 ? "attempt" : "attempts"} remaining`
      : maxAttempts == null
        ? "Unlimited attempts"
        : `${maxAttempts} max attempts`;

  const statusTitle = submission?.is_published
    ? "Grade Published"
    : isGraded
      ? "Reviewed by Your Instructor"
      : "Submitted, Awaiting Result";
  const lockedReason = markingLockedMessage
    ? markingLockedMessage
    : isAwaitingModeratedResult || isBeingMarked
      ? "Editing is paused while your essay is being marked."
      : deadlinePassed
        ? "The deadline for this essay has passed."
        : "This essay has been graded and can no longer be resubmitted.";
  const wordCount = contentText.trim() ? contentText.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-5">
      {isFinalAssessment && (
        <FinalAssessmentNotice isLastSection={isLastSection}>
          {isLastSection ? "Pass this to complete the course." : "Pass this to unlock the next module."}
          {typeof passMarkPercentage === "number" ? ` Pass mark ${passMarkPercentage}%.` : ""}{" "}
          {typeof attemptsUsed === "number"
            ? `${attemptsUsed} graded ${attemptsUsed === 1 ? "attempt" : "attempts"} so far. `
            : ""}
          {attemptsLabel}.
        </FinalAssessmentNotice>
      )}

      <MetaPills
        items={[
          mode === "DOCUMENT" ? "Document upload" : "Written response",
          deadline && formatDue(deadline),
        ]}
      />

      <div>
        <h2
          id="essay-question"
          className="m-0 font-[family-name:var(--font-roboto)] text-[1.1875rem] font-semibold leading-snug tracking-[-0.01em] text-ink sm:text-[1.3125rem]"
        >
          {essayQuestion || "Essay Assignment"}
        </h2>
        {essayDescription && (
          <p className="mb-0 mt-2 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-2">{essayDescription}</p>
        )}
      </div>

      {hasSubmission && (
        <div className="lms-group">
          <div className="flex items-start gap-3.5 p-[1.1rem]">
            <span
              className={`lms-sym lms-sym--sm ${
                submission?.is_published
                  ? submission.passed === false && isFinalAssessment
                    ? "lms-sym--red"
                    : "lms-sym--green"
                  : isGraded
                    ? "lms-sym--blue"
                    : "lms-sym--gold"
              }`}
              aria-hidden="true"
            >
              {submission?.is_published ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="m-0 font-[family-name:var(--font-roboto)] text-[0.9375rem] font-semibold tracking-normal text-ink">
                {statusTitle}
              </h3>
              {submission?.submitted_at && (
                <p className="m-0 mt-0.5 text-[0.8125rem] text-ink-3">
                  Submitted{" "}
                  {new Intl.DateTimeFormat("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "Africa/Lagos",
                  }).format(new Date(submission.submitted_at))}
                </p>
              )}
              {!submission?.is_published && (
                <p className="m-0 mt-2 text-sm leading-relaxed text-ink-2">
                  {isGraded
                    ? "Your instructor has reviewed this essay. The grade hasn't been published yet."
                    : isAwaitingModeratedResult || isBeingMarked
                      ? "Your essay is being marked. Your result will appear here once it's released."
                      : "You can resubmit until marking begins or the deadline passes."}
                </p>
              )}
            </div>
            {submission?.is_published && typeof submission.score === "number" && (
              <div className="text-right">
                <p className="lms-num lms-score m-0">{submission.score}</p>
                {isFinalAssessment && typeof submission.passed === "boolean" && (
                  <span className={`lms-pill mt-1 ${submission.passed ? "lms-pill--green" : "!bg-[#e5483d]/12 !text-[#d92d20]"}`}>
                    {submission.passed ? <CheckCircle2 /> : <XCircle />}
                    {submission.passed ? "Passed" : "Not passed"}
                  </span>
                )}
              </div>
            )}
          </div>

          {submission?.is_published && submission.feedback && (
            <div className="px-[1.1rem] pb-[1.1rem]">
              <p className="m-0 mb-1.5 text-[0.8125rem] font-semibold text-ink-3">Feedback</p>
              <p className="lms-well m-0 whitespace-pre-line p-3.5 text-sm leading-relaxed text-ink">
                {submission.feedback}
              </p>
            </div>
          )}

          {submission?.document_download_url && (
            <a
              href={submission.document_download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="lms-row !shadow-[inset_0_1px_0_var(--sw-line)]"
            >
              <span className="lms-sym lms-sym--sm lms-sym--blue" aria-hidden="true">
                <FileText className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-ink">
                {submission.document_file_name || "Your submission"}
              </span>
              <span className="text-[0.8125rem] font-semibold text-accent">Open</span>
            </a>
          )}
        </div>
      )}

      <div>
        <h2 className="lms-group-head font-[family-name:var(--font-roboto)] tracking-normal">
          {hasSubmission ? "Resubmit" : "Your Response"}
        </h2>
        <div className="lms-group">
          {mode === "TEXT" ? (
            <textarea
              id="essay-response"
              aria-labelledby="essay-question"
              value={contentText}
              onChange={(event) => setContentText(event.target.value)}
              disabled={!canSubmit || submitting}
              rows={12}
              className="lms-editor"
              placeholder="Start writing…"
            />
          ) : (
            <label className="lms-drop" aria-disabled={!canSubmit || submitting ? "true" : undefined}>
              <span className="lms-sym lms-sym--blue mb-2" aria-hidden="true">
                <Upload className="h-[1.1rem] w-[1.1rem]" />
              </span>
              <span className="text-[0.9375rem] font-semibold text-ink">{file ? file.name : "Choose a Document"}</span>
              <span className="text-[0.8125rem] text-ink-3">
                {file ? "Ready to submit. Choose again to replace it." : "Upload your final file, then submit it for marking."}
              </span>
              <input
                type="file"
                disabled={!canSubmit || submitting}
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="sr-only"
              />
            </label>
          )}

          <div className="lms-group-foot">
            <p>
              {!canSubmit
                ? lockedReason
                : mode === "TEXT"
                  ? `${wordCount} ${wordCount === 1 ? "word" : "words"} · you can update this until marking begins.`
                  : "You can update your submission until marking begins."}
            </p>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={!canSubmit || submitting || (mode === "TEXT" && contentText.trim().length === 0)}
              className="lms-btn lms-btn--sm"
            >
              {submitting ? <IconSpinner className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting…" : hasSubmission ? "Resubmit" : "Submit Essay"}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" aria-live="assertive" className="lms-group-note !text-[#d92d20]">
            {error}
          </p>
        )}
        {success && (
          <p role="status" aria-live="polite" className="lms-group-note !text-accent">
            {success}
          </p>
        )}
        <ConfirmSubmitDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          busy={submitting}
          title={hasSubmission ? "Resubmit your essay?" : "Submit your essay?"}
          confirmLabel={hasSubmission ? "Yes, resubmit" : "Yes, submit"}
          onConfirm={() => {
            setConfirmOpen(false);
            void (mode === "TEXT" ? handleTextSubmit() : handleDocumentSubmit());
          }}
        >
          Your essay goes to be marked and you won&apos;t be able to edit it once marking begins. Make sure this is
          your final version.
        </ConfirmSubmitDialog>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function isBeingMarkedMessage(message: string) {
  return message.toLowerCase().includes("being marked");
}

function isMarkInProgressStatus(status?: string) {
  return Boolean(
    status &&
      [
        "DRAFT_MARK",
        "AWAITING_MODERATION",
        "MODERATED",
        "APPROVED",
        "RETURNED_TO_MARKER",
        "UNDER_APPEAL",
      ].includes(status),
  );
}
