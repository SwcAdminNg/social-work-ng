"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  PlayCircle,
  RotateCcw,
  Send,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";

type QuizGroupOption = { id: string; text: string };

type QuizGroupQuestion = {
  id: string;
  text: string;
  allow_multiple_answers?: boolean | null;
  multi_answer_mode?: string | null;
  options: QuizGroupOption[];
};

type QuizGroupAttemptSection = {
  section_id: string;
  title: string;
  questions: QuizGroupQuestion[];
};

type QuizGroupSectionSummary = {
  id: string;
  title: string;
  order_index?: number | null;
  question_count?: number | null;
};

type QuizGroupSectionResult = {
  section_id: string;
  title: string;
  earned_points: number;
  total_questions: number;
  score_percent: number;
};

type ActiveAttempt = {
  attempt_id: string;
  started_at?: string | null;
  expires_at?: string | null;
  sections: QuizGroupAttemptSection[];
  saved_answers?: Record<string, string[]> | null;
};

type QuizGroupResult = {
  attempt_id?: string;
  score: number | null;
  passed: boolean | null;
  auto_submitted?: boolean | null;
  sections?: QuizGroupSectionResult[] | null;
  result_visible?: boolean | null;
  section_reset?: boolean | null;
  course_reset?: boolean | null;
  message?: string;
};

type QuizGroupData = {
  max_attempts?: number | null;
  attempts_used?: number | null;
  attempts_remaining?: number | null;
  pass_mark_percentage?: number | null;
  show_result_to_student?: boolean | null;
  time_limit_seconds?: number | null;
  sections: QuizGroupSectionSummary[];
  active_attempt?: ActiveAttempt | null;
  previous_result?: QuizGroupResult | null;
};

interface QuizGroupEngineProps {
  courseId: string;
  itemId: string;
  title: string;
  estimatedMinutes?: number | null;
  dueDate?: string | null;
  isFinalAssessment?: boolean | null;
  sectionFirstItemId?: string | null;
  quizGroup: QuizGroupData;
}

export function QuizGroupEngine({
  courseId,
  itemId,
  estimatedMinutes,
  dueDate,
  isFinalAssessment,
  sectionFirstItemId,
  quizGroup,
}: QuizGroupEngineProps) {
  const router = useRouter();
  const [currentTime] = useState(() => Date.now());
  const [attempt, setAttempt] = useState<ActiveAttempt | null>(quizGroup.active_attempt || null);
  const [answers, setAnswers] = useState<Record<string, string[]>>(
    quizGroup.active_attempt?.saved_answers || {},
  );
  const [result, setResult] = useState<QuizGroupResult | null>(quizGroup.previous_result || null);
  const [attemptsUsedThisSession, setAttemptsUsedThisSession] = useState(0);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const submittedRef = useRef(false);

  const deadline = dueDate ? new Date(dueDate) : null;
  const deadlinePassed = deadline ? deadline.getTime() < currentTime : false;
  const effectiveAttemptsRemaining =
    quizGroup.attempts_remaining == null
      ? null
      : Math.max(quizGroup.attempts_remaining - attemptsUsedThisSession, 0);
  const hasAttemptsRemaining = effectiveAttemptsRemaining == null || effectiveAttemptsRemaining > 0;
  const canStart = !deadlinePassed && hasAttemptsRemaining;

  const expiresAtMs = attempt?.expires_at ? new Date(attempt.expires_at).getTime() : null;
  const remainingMs = expiresAtMs != null ? Math.max(expiresAtMs - now, 0) : null;

  // Tick the countdown once a second while an attempt is active and timed.
  useEffect(() => {
    if (!attempt || expiresAtMs == null) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [attempt, expiresAtMs]);

  const handleSubmit = async (auto = false) => {
    if (!attempt || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(
        `/api/proxy/learning/courses/${courseId}/items/${itemId}/quiz-group/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attempt_id: attempt.attempt_id, answers: answersRef.current }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to submit quiz group");

      setResult({
        score: data.data?.score ?? null,
        passed: data.data?.passed ?? null,
        auto_submitted: data.data?.auto_submitted ?? auto,
        sections: data.data?.sections ?? null,
        result_visible: data.data?.result_visible !== false,
        section_reset: data.data?.section_reset === true,
        course_reset: data.data?.course_reset === true,
        message: data.message,
      });
      setAttemptsUsedThisSession((count) => count + 1);
      setAttempt(null);
      router.refresh();
    } catch (err: unknown) {
      submittedRef.current = false;
      setError(getErrorMessage(err, "Failed to submit quiz group"));
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-submit once the countdown reaches zero.
  useEffect(() => {
    if (attempt && remainingMs === 0 && !submittedRef.current) {
      handleSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, remainingMs]);

  // Periodically autosave progress while an attempt is active.
  useEffect(() => {
    if (!attempt) return;

    const saveProgress = async () => {
      try {
        const res = await fetch(
          `/api/proxy/learning/courses/${courseId}/items/${itemId}/quiz-group/progress`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ attempt_id: attempt.attempt_id, answers: answersRef.current }),
          },
        );
        if (res.status === 400 && !submittedRef.current) {
          // Timer ran out server-side before our countdown noticed.
          handleSubmit(true);
        }
      } catch {
        // Best-effort autosave; ignore transient network errors.
      }
    };

    const interval = setInterval(saveProgress, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, courseId, itemId]);

  const handleStart = async () => {
    setStarting(true);
    setError("");
    try {
      const res = await fetch(
        `/api/proxy/learning/courses/${courseId}/items/${itemId}/quiz-group/start`,
        { method: "POST" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to start quiz group");

      submittedRef.current = false;
      setResult(null);
      setAttempt({
        attempt_id: data.data?.attempt_id,
        started_at: data.data?.started_at,
        expires_at: data.data?.expires_at,
        sections: data.data?.sections || [],
        saved_answers: data.data?.saved_answers || {},
      });
      setAnswers(data.data?.saved_answers || {});
      setNow(Date.now());
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to start quiz group"));
    } finally {
      setStarting(false);
    }
  };

  const toggleOption = (qId: string, oId: string, allowMultiple: boolean) => {
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

  const isReset = result?.section_reset || result?.course_reset;
  const resetHref = result?.course_reset
    ? `/learn/${courseId}`
    : sectionFirstItemId
      ? `/learn/${courseId}/item/${sectionFirstItemId}`
      : `/learn/${courseId}`;

  const attemptLabel =
    effectiveAttemptsRemaining == null
      ? quizGroup.max_attempts == null
        ? "Unlimited attempts"
        : `${quizGroup.max_attempts} max attempts`
      : `${effectiveAttemptsRemaining} ${effectiveAttemptsRemaining === 1 ? "attempt" : "attempts"} remaining`;

  return (
    <div className="mx-auto max-w-[860px] space-y-4">
      {isFinalAssessment && (
        <section className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h2 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
              Final assessment for this module
            </h2>
            <p className="mt-1 text-sm font-medium leading-6 text-amber-800 dark:text-amber-300">
              You must pass this to unlock the next module. Running out of attempts without
              passing resets this module (or the course, if this is the last one). {attemptLabel}.
            </p>
          </div>
        </section>
      )}

      {isReset && result && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-red-600 text-white">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                  {result.course_reset ? "Course reset" : "Module reset"}
                </h2>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                  {result.message ||
                    (result.course_reset
                      ? "You're out of retries. The entire course has been reset."
                      : "You're out of retries. This module has been reset.")}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(resetHref)}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#2D6A4F] px-4 text-sm font-extrabold text-white shadow-sm shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d] sm:w-auto"
            >
              {result.course_reset ? "Restart course" : "Restart module"}
            </button>
          </div>
        </section>
      )}

      {result && !isReset && !attempt && (
        <section
          className={`rounded-lg border p-4 shadow-sm sm:p-5 ${
            result.result_visible && result.passed
              ? "border-[#b7e4c7] bg-[#f0fbf5] dark:border-[#27433a] dark:bg-[#13231d]"
              : result.result_visible && result.passed === false
                ? "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20"
                : "border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ${
                  result.result_visible && result.passed
                    ? "bg-[#2D6A4F] text-white dark:bg-[#52b788] dark:text-[#06130d]"
                    : result.result_visible && result.passed === false
                      ? "bg-red-600 text-white"
                      : "bg-blue-600 text-white"
                }`}
              >
                {result.result_visible && result.passed === false ? (
                  <XCircle className="h-5 w-5" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">
                  {result.result_visible
                    ? result.passed
                      ? "Quiz group passed"
                      : "Try again"
                    : "Quiz group submitted"}
                </h2>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                  {result.result_visible && typeof result.score === "number" ? (
                    <>
                      Score: <span className="font-extrabold text-slate-950 dark:text-white">{result.score}%</span>
                    </>
                  ) : (
                    "Your submission was recorded. Results are not available for this quiz group."
                  )}
                </p>
                {result.auto_submitted && (
                  <p className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                    Time&apos;s up - this attempt was submitted automatically.
                  </p>
                )}
              </div>
            </div>

            {canStart && (
              <button
                onClick={handleStart}
                disabled={starting}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#b7e4c7] bg-white px-4 text-sm font-extrabold text-[#2D6A4F] transition hover:bg-[#e7f6ee] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#27433a] dark:bg-[#111525] dark:text-[#b7e4c7] dark:hover:bg-[#183026] sm:w-auto"
              >
                {starting ? <IconSpinner className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                {result.passed ? "Retake" : "Try Again"}
              </button>
            )}
          </div>

          {result.result_visible && result.sections && result.sections.length > 0 && (
            <div className="mt-4 grid gap-2 border-t border-black/5 pt-4 dark:border-white/10">
              {result.sections.map((sec) => (
                <div
                  key={sec.section_id}
                  className="flex items-center justify-between rounded-md bg-white/60 px-3 py-2 text-sm font-bold text-slate-700 dark:bg-white/5 dark:text-slate-200"
                >
                  <span>{sec.title}</span>
                  <span>
                    {sec.earned_points}/{sec.total_questions} ({Math.round(sec.score_percent)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!attempt && !result && (
        <section className="rounded-lg border border-[#dceee4] bg-white shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
          <div className="border-b border-[#dceee4] px-4 py-3 dark:border-[#27433a] sm:px-5">
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white">Quiz Group</h2>
            <div className="mt-2 flex flex-wrap gap-2 text-[0.68rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <span className="rounded-md bg-[#f7fcf9] px-2 py-1 dark:bg-[#0f1726]">
                {quizGroup.sections.length} sections
              </span>
              {typeof quizGroup.pass_mark_percentage === "number" && (
                <span className="rounded-md bg-[#f7fcf9] px-2 py-1 dark:bg-[#0f1726]">
                  {quizGroup.pass_mark_percentage}% pass mark
                </span>
              )}
              {typeof estimatedMinutes === "number" && estimatedMinutes > 0 && (
                <span className="rounded-md bg-[#f7fcf9] px-2 py-1 dark:bg-[#0f1726]">
                  {formatMinutes(estimatedMinutes)}
                </span>
              )}
              {quizGroup.time_limit_seconds ? (
                <span className="rounded-md bg-[#f7fcf9] px-2 py-1 dark:bg-[#0f1726]">
                  {formatSeconds(quizGroup.time_limit_seconds)} time limit
                </span>
              ) : null}
              <span className="rounded-md bg-[#f7fcf9] px-2 py-1 dark:bg-[#0f1726]">{attemptLabel}</span>
              {deadline && (
                <span className="rounded-md bg-[#f7fcf9] px-2 py-1 dark:bg-[#0f1726]">
                  Due {deadline.toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="divide-y divide-[#edf5f0] dark:divide-[#24372e]">
            {quizGroup.sections.map((sec, idx) => (
              <div key={sec.id} className="flex items-center justify-between px-4 py-3 sm:px-5">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {idx + 1}. {sec.title}
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {sec.question_count ?? "?"} questions
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#dceee4] px-4 py-4 dark:border-[#27433a] sm:px-5">
            {error && <p className="mb-3 text-sm font-bold text-red-600 dark:text-red-400">{error}</p>}
            {canStart ? (
              <button
                onClick={handleStart}
                disabled={starting}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#2D6A4F] px-5 text-sm font-extrabold text-white shadow-sm shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d] sm:w-auto"
              >
                {starting ? <IconSpinner className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                {starting ? "Starting..." : "Start"}
              </button>
            ) : (
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {deadlinePassed
                  ? "The deadline for this quiz group has passed."
                  : "You have no attempts remaining for this quiz group."}
              </p>
            )}
          </div>
        </section>
      )}

      {attempt && (
        <section className="rounded-lg border border-[#dceee4] bg-white shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#dceee4] bg-white/95 px-4 py-3 backdrop-blur dark:border-[#27433a] dark:bg-[#111525]/95 sm:px-5">
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white">Quiz Group</h2>
            {remainingMs != null && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-extrabold ${
                  remainingMs < 60000
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]"
                }`}
              >
                <Clock className="h-4 w-4" />
                {formatCountdown(remainingMs)}
              </span>
            )}
          </div>

          {error && (
            <p className="px-4 pt-3 text-sm font-bold text-red-600 dark:text-red-400 sm:px-5">{error}</p>
          )}

          <div className="divide-y divide-[#edf5f0] dark:divide-[#24372e]">
            {attempt.sections.map((sec, secIdx) => (
              <div key={sec.section_id} className="px-4 py-4 sm:px-5">
                <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-[#2D6A4F] dark:text-[#b7e4c7]">
                  Section {secIdx + 1}: {sec.title}
                </h3>
                <div className="space-y-4">
                  {sec.questions.map((q, qIdx) => (
                    <div key={q.id}>
                      <h4 className="text-sm font-extrabold leading-6 text-slate-900 dark:text-white">
                        <span className="mr-2 text-[#2D6A4F] dark:text-[#b7e4c7]">{qIdx + 1}.</span>
                        {q.text}
                      </h4>
                      <div className="mt-2 grid gap-2">
                        {q.options.map((opt) => {
                          const isSelected = (answers[q.id] || []).includes(opt.id);
                          return (
                            <label
                              key={opt.id}
                              className={`grid cursor-pointer grid-cols-[18px_minmax(0,1fr)] items-start gap-3 rounded-md border px-3 py-2.5 transition hover:border-[#b7e4c7] hover:bg-[#f0fbf5] dark:hover:border-[#40916c] dark:hover:bg-[#183026] ${
                                isSelected
                                  ? "border-[#2D6A4F] bg-[#e7f6ee] dark:border-[#52b788] dark:bg-[#52b788]/12"
                                  : "border-[#e3ede7] bg-[#fbfefd] dark:border-[#27433a] dark:bg-[#0f1726]"
                              }`}
                            >
                              <input
                                type={q.allow_multiple_answers ? "checkbox" : "radio"}
                                name={q.id}
                                checked={isSelected}
                                onChange={() =>
                                  toggleOption(q.id, opt.id, q.allow_multiple_answers === true)
                                }
                                className={`mt-0.5 h-4 w-4 flex-shrink-0 border-[#b7e4c7] text-[#2D6A4F] focus:ring-[#2D6A4F] dark:border-[#315244] dark:bg-[#111525] dark:text-[#52b788] ${q.allow_multiple_answers ? "rounded" : ""}`}
                              />
                              <span className="text-sm font-medium leading-5 text-slate-700 dark:text-slate-300">
                                {opt.text}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#dceee4] px-4 py-4 dark:border-[#27433a] sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Your progress is saved automatically. Unanswered questions will be scored as 0.
              </p>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#2D6A4F] px-5 text-sm font-extrabold text-white shadow-sm shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d] sm:w-auto"
              >
                {submitting ? <IconSpinner className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

function formatSeconds(seconds: number) {
  const minutes = Math.round(seconds / 60);
  return formatMinutes(minutes);
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
