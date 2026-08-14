"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, RotateCcw, Send, XCircle } from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";

interface QuizEngineProps {
  courseId: string;
  itemId: string;
  isCompleted: boolean;
  questions: QuizQuestion[];
  maxAttempts?: number | null;
  attemptsUsed?: number | null;
  attemptsRemaining?: number | null;
  passMarkPercentage?: number | null;
  dueDate?: string | null;
  previousAttempt?: {
    score?: number | null;
    passed?: boolean | null;
    answers?: Record<string, string[]> | null;
    result_visible?: boolean | null;
  } | null;
}

type QuizQuestion = {
  id: string;
  text: string;
  allow_multiple_answers?: boolean | null;
  options: Array<{
    id: string;
    text: string;
  }>;
};

type QuizResult = {
  passed: boolean | null;
  score: number | null;
  resultVisible: boolean;
  message?: string;
};

export function QuizEngine({
  courseId,
  itemId,
  isCompleted,
  questions,
  maxAttempts,
  attemptsUsed,
  attemptsRemaining,
  passMarkPercentage,
  dueDate,
  previousAttempt,
}: QuizEngineProps) {
  const router = useRouter();
  const [currentTime] = useState(() => Date.now());
  const [answers, setAnswers] = useState<Record<string, string[]>>(previousAttempt?.answers || {});
  const [submitting, setSubmitting] = useState(false);
  const [attemptsUsedThisSession, setAttemptsUsedThisSession] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(
    previousAttempt
      ? {
          passed: previousAttempt.passed ?? null,
          score: previousAttempt.score ?? null,
          resultVisible: previousAttempt.result_visible !== false,
        }
      : null,
  );
  const [error, setError] = useState("");

  const deadline = dueDate ? new Date(dueDate) : null;
  const deadlinePassed = deadline ? deadline.getTime() < currentTime : false;
  const effectiveAttemptsRemaining =
    attemptsRemaining == null
      ? null
      : Math.max(attemptsRemaining - attemptsUsedThisSession, 0);
  const effectiveAttemptsUsed =
    typeof attemptsUsed === "number" ? attemptsUsed + attemptsUsedThisSession : null;
  const hasAttemptsRemaining = effectiveAttemptsRemaining == null || effectiveAttemptsRemaining > 0;
  const canSubmit = !deadlinePassed && hasAttemptsRemaining;
  const isReviewingResult = result !== null;

  const toggleOption = (qId: string, oId: string, allowMultiple: boolean) => {
    if (isReviewingResult || !canSubmit) return;

    setAnswers((prev) => {
      const current = prev[qId] || [];
      if (allowMultiple) {
        return {
          ...prev,
          [qId]: current.includes(oId) ? current.filter((id) => id !== oId) : [...current, oId],
        };
      }

      return { ...prev, [qId]: [oId] };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/proxy/learning/courses/${courseId}/items/${itemId}/quiz/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to submit quiz");

      setResult({
        passed: data.data?.passed ?? null,
        score: data.data?.score ?? null,
        resultVisible: data.data?.result_visible !== false,
        message: data.message,
      });
      setAttemptsUsedThisSession((count) => count + 1);

      router.refresh();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to submit quiz"));
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = questions.filter((q) => answers[q.id] && answers[q.id].length > 0).length;
  const hasUnanswered = answeredCount < questions.length;
  const isFormDisabled = isReviewingResult || !canSubmit;
  const attemptLabel =
    effectiveAttemptsRemaining == null
      ? maxAttempts == null
        ? "Unlimited attempts"
        : `${maxAttempts} max attempts`
      : `${effectiveAttemptsRemaining} ${effectiveAttemptsRemaining === 1 ? "attempt" : "attempts"} remaining`;

  return (
    <div className="mx-auto max-w-[860px] space-y-4">
      {result && (
        <section className={`rounded-lg border p-4 shadow-sm sm:p-5 ${
          result.resultVisible && result.passed
            ? "border-[#b7e4c7] bg-[#f0fbf5] dark:border-[#27433a] dark:bg-[#13231d]"
            : result.resultVisible && result.passed === false
              ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20"
              : "border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20"
        }`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ${
                result.resultVisible && result.passed
                  ? "bg-[#2D6A4F] text-white dark:bg-[#52b788] dark:text-[#06130d]"
                  : result.resultVisible && result.passed === false
                    ? "bg-red-600 text-white"
                    : "bg-blue-600 text-white"
              }`}>
                {result.resultVisible && result.passed === false ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                  {result.resultVisible
                    ? result.passed
                      ? "Quiz passed"
                      : "Try again"
                    : "Quiz submitted"}
                </h2>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                  {result.resultVisible && typeof result.score === "number"
                    ? <>Score: <span className="font-extrabold text-slate-950 dark:text-white">{result.score}%</span></>
                    : "Your submission was recorded. Results are not available for this quiz."}
                </p>
                {result.message && !result.resultVisible && (
                  <p className="mt-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                    {result.message}
                  </p>
                )}
              </div>
            </div>

            {canSubmit && (
              <button
                onClick={() => {
                  setResult(null);
                  setAnswers(previousAttempt?.answers || {});
                }}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#b7e4c7] bg-white px-4 text-sm font-extrabold text-[#2D6A4F] transition hover:bg-[#e7f6ee] dark:border-[#27433a] dark:bg-[#111525] dark:text-[#b7e4c7] dark:hover:bg-[#183026] sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" />
                {result.resultVisible && result.passed ? "Retake" : "Try Again"}
              </button>
            )}
          </div>
        </section>
      )}

      {!result && isCompleted && !previousAttempt && (
        <section className="rounded-lg border border-[#b7e4c7] bg-[#f0fbf5] p-4 shadow-sm dark:border-[#27433a] dark:bg-[#13231d]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#2D6A4F] text-white dark:bg-[#52b788] dark:text-[#06130d]">
              <CheckCircle className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-950 dark:text-white">Quiz completed</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">You have already completed this quiz.</p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-[#dceee4] bg-white shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
        <div className="border-b border-[#dceee4] px-4 py-3 dark:border-[#27433a] sm:px-5">
          <h2 className="text-base font-extrabold text-slate-950 dark:text-white">Knowledge Check</h2>
          <div className="mt-2 flex flex-wrap gap-2 text-[0.68rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <span className="rounded-md bg-[#f7fcf9] px-2 py-1 dark:bg-[#0f1726]">{questions.length} questions</span>
            {typeof passMarkPercentage === "number" && <span className="rounded-md bg-[#f7fcf9] px-2 py-1 dark:bg-[#0f1726]">{passMarkPercentage}% pass mark</span>}
            {effectiveAttemptsUsed !== null && <span className="rounded-md bg-[#f7fcf9] px-2 py-1 dark:bg-[#0f1726]">{effectiveAttemptsUsed} used</span>}
            <span className="rounded-md bg-[#f7fcf9] px-2 py-1 dark:bg-[#0f1726]">{attemptLabel}</span>
            {deadline && <span className="rounded-md bg-[#f7fcf9] px-2 py-1 dark:bg-[#0f1726]">Due {deadline.toLocaleDateString()}</span>}
          </div>
        </div>

        <div className="divide-y divide-[#edf5f0] dark:divide-[#24372e]">
          {questions.map((q, idx) => (
            <div key={q.id} className="px-4 py-4 sm:px-5">
              <h3 className="text-sm font-extrabold leading-6 text-slate-900 dark:text-white">
                <span className="mr-2 text-[#2D6A4F] dark:text-[#b7e4c7]">{idx + 1}.</span>
                {q.text}
              </h3>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt) => {
                  const isSelected = (answers[q.id] || []).includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={`grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 rounded-md border px-3 py-2.5 transition ${
                        isSelected
                          ? "border-[#2D6A4F] bg-[#e7f6ee] dark:border-[#52b788] dark:bg-[#52b788]/12"
                          : "border-[#e3ede7] bg-[#fbfefd] dark:border-[#27433a] dark:bg-[#0f1726]"
                      } ${!isFormDisabled ? "cursor-pointer hover:border-[#b7e4c7] hover:bg-[#f0fbf5] dark:hover:border-[#40916c] dark:hover:bg-[#183026]" : "opacity-90"}`}
                    >
                      <input
                        type={q.allow_multiple_answers ? "checkbox" : "radio"}
                        name={q.id}
                        checked={isSelected}
                        disabled={isFormDisabled}
                        onChange={() => toggleOption(q.id, opt.id, q.allow_multiple_answers === true)}
                        className={`mt-0.5 h-4 w-4 flex-shrink-0 border-[#b7e4c7] text-[#2D6A4F] focus:ring-[#2D6A4F] dark:border-[#315244] dark:bg-[#111525] dark:text-[#52b788] ${q.allow_multiple_answers ? "rounded" : ""}`}
                      />
                      <span className="text-sm font-medium leading-5 text-slate-700 dark:text-slate-300">{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {!isFormDisabled && (
          <div className="border-t border-[#dceee4] px-4 py-4 dark:border-[#27433a] sm:px-5">
            {error && <p className="mb-3 text-sm font-bold text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {hasUnanswered ? "Unanswered questions will be scored as 0." : "All questions have a selected answer."}
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#2D6A4F] px-5 text-sm font-extrabold text-white shadow-sm shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d] sm:w-auto"
              >
                {submitting ? <IconSpinner className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        )}

        {!isReviewingResult && !canSubmit && (
          <div className="border-t border-[#dceee4] px-4 py-4 text-sm font-bold text-slate-600 dark:border-[#27433a] dark:text-slate-300 sm:px-5">
            {deadlinePassed ? "The deadline for this quiz has passed." : "You have no attempts remaining for this quiz."}
          </div>
        )}
      </section>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
