"use client";

import { ConfirmSubmitDialog } from "./ConfirmSubmitDialog";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlayCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { QuizFocusShell, RetryNote, formatCountdown } from "./QuizFocusMode";
import { IconSpinner } from "@/components/auth/shared/icons";
import {
  ChoiceList,
  FinalAssessmentNotice,
  MetaPills,
  Notice,
  QuestionProgress,
  formatDue,
  formatMinutes,
} from "./AssessmentParts";

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
  /** A retry reworded by AI. */
  paraphrased?: boolean | null;
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
  isLastSection?: boolean;
  quizGroup: QuizGroupData;
}

export function QuizGroupEngine({
  courseId,
  itemId,
  title,
  dueDate,
  isFinalAssessment,
  sectionFirstItemId,
  isLastSection,
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Full-screen focus mode. An attempt resumed after a reload waits for "Resume Quiz".
  const [focusOpen, setFocusOpen] = useState(false);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  const submittedRef = useRef(false);
  const timeWarningsAnnouncedRef = useRef<{ oneMinute: boolean; tenSeconds: boolean }>({
    oneMinute: false,
    tenSeconds: false,
  });
  const [timeWarning, setTimeWarning] = useState("");

  // Once the server-provided attempts_remaining reflects a submission (after router.refresh()),
  // drop the local session counter so we don't double-subtract the same attempt.
  const [prevAttemptsSnapshot, setPrevAttemptsSnapshot] = useState({
    attemptsUsed: quizGroup.attempts_used,
    attemptsRemaining: quizGroup.attempts_remaining,
  });
  if (
    prevAttemptsSnapshot.attemptsUsed !== quizGroup.attempts_used ||
    prevAttemptsSnapshot.attemptsRemaining !== quizGroup.attempts_remaining
  ) {
    setPrevAttemptsSnapshot({
      attemptsUsed: quizGroup.attempts_used,
      attemptsRemaining: quizGroup.attempts_remaining,
    });
    setAttemptsUsedThisSession(0);
  }

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

  // Announce accessible warnings at the 60s and 10s marks before auto-submit.
  useEffect(() => {
    if (remainingMs == null) return;
    if (remainingMs <= 10000 && !timeWarningsAnnouncedRef.current.tenSeconds) {
      timeWarningsAnnouncedRef.current.tenSeconds = true;
      setTimeWarning("10 seconds remaining. This quiz attempt will be submitted automatically.");
    } else if (remainingMs <= 60000 && !timeWarningsAnnouncedRef.current.oneMinute) {
      timeWarningsAnnouncedRef.current.oneMinute = true;
      setTimeWarning("1 minute remaining in this quiz attempt.");
    }
  }, [remainingMs]);

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
      setFocusOpen(false);
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
      timeWarningsAnnouncedRef.current = { oneMinute: false, tenSeconds: false };
      setTimeWarning("");
      setResult(null);
      setAttempt({
        attempt_id: data.data?.attempt_id,
        started_at: data.data?.started_at,
        expires_at: data.data?.expires_at,
        sections: data.data?.sections || [],
        saved_answers: data.data?.saved_answers || {},
        paraphrased: data.data?.paraphrased === true,
      });
      setAnswers(data.data?.saved_answers || {});
      setCurrentQuestionIndex(0);
      setNow(Date.now());
      setFocusOpen(true);
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

  const attemptQuestions =
    attempt?.sections.flatMap((sec, secIdx) =>
      sec.questions.map((question, questionIdx) => ({
        question,
        sectionId: sec.section_id,
        sectionTitle: sec.title,
        sectionIndex: secIdx,
        questionIndex: questionIdx,
      })),
    ) || [];
  const answeredCount = attemptQuestions.filter(({ question }) => (answers[question.id] || []).length > 0).length;
  const unansweredCount = attemptQuestions.length - answeredCount;
  const boundedQuestionIndex =
    attemptQuestions.length > 0 ? Math.min(currentQuestionIndex, attemptQuestions.length - 1) : 0;
  const currentQuestionItem = attemptQuestions[boundedQuestionIndex] || null;

  const metaItems = [
    `${quizGroup.sections.length} ${quizGroup.sections.length === 1 ? "section" : "sections"}`,
    typeof quizGroup.pass_mark_percentage === "number" && `${quizGroup.pass_mark_percentage}% to pass`,
    quizGroup.time_limit_seconds ? `${formatSeconds(quizGroup.time_limit_seconds)} time limit` : null,
    attemptLabel,
    deadline && formatDue(deadline),
  ];

  return (
    <div className="space-y-5">
      {isFinalAssessment && (
        <FinalAssessmentNotice isLastSection={isLastSection}>
          {isLastSection
            ? "Pass this to complete the course. Running out of attempts without passing resets the whole course."
            : "Pass this to unlock the next module. Running out of attempts without passing resets this module."}{" "}
          {attemptLabel}.
        </FinalAssessmentNotice>
      )}

      {isReset && result && (
        <Notice
          tone="red"
          role="alert"
          icon={<AlertTriangle className="h-4 w-4" />}
          title={result.course_reset ? "Course Reset" : "Module Reset"}
          action={
            <button type="button" onClick={() => router.push(resetHref)} className="lms-btn lms-btn--sm">
              {result.course_reset ? "Restart Course" : "Restart Module"}
            </button>
          }
        >
          {result.message ||
            (result.course_reset
              ? "You're out of attempts, so the whole course has been reset."
              : "You're out of attempts, so this module has been reset.")}
        </Notice>
      )}

      {result && !isReset && !attempt && (
        <div className="space-y-3">
          <Notice
            tone={result.result_visible ? (result.passed ? "green" : "red") : "blue"}
            role="status"
            icon={
              result.result_visible && result.passed === false ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )
            }
            title={result.result_visible ? (result.passed ? "You Passed" : "Not Quite") : "Quiz Submitted"}
            action={
              canStart ? (
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={starting}
                  className="lms-btn lms-btn--sm lms-btn--tinted"
                >
                  {starting ? <IconSpinner className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                  {result.passed ? "Retake" : "Try Again"}
                </button>
              ) : undefined
            }
          >
            {result.result_visible && typeof result.score === "number" ? (
              <>
                You scored <strong className="font-semibold text-ink">{result.score}%</strong>
                {typeof quizGroup.pass_mark_percentage === "number"
                  ? ` · pass mark ${quizGroup.pass_mark_percentage}%`
                  : ""}
                .
              </>
            ) : (
              "Your answers were recorded. Results aren't shown for this quiz."
            )}
            {result.auto_submitted && (
              <span className="mt-1 block font-medium text-[#b26a00] dark:text-[#f0b54a]">
                Time ran out, so this attempt was submitted for you.
              </span>
            )}
          </Notice>

          {result.result_visible && result.sections && result.sections.length > 0 && (
            <div>
              <h2 className="lms-group-head font-[family-name:var(--font-roboto)] tracking-normal">Sections</h2>
              <div className="lms-group">
                {result.sections.map((sec) => (
                  <div key={sec.section_id} className="lms-detail">
                    <span className="lms-detail-label min-w-0 truncate">{sec.title}</span>
                    <span className="lms-detail-value tabular-nums">
                      {sec.earned_points} of {sec.total_questions} · {Math.round(sec.score_percent)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!attempt && (
        <>
          <MetaPills items={metaItems} />

          {!result && (
            <div>
              <h2 className="lms-group-head font-[family-name:var(--font-roboto)] tracking-normal">In This Quiz</h2>
              <div className="lms-group">
                {quizGroup.sections.map((sec, idx) => (
                  <div key={sec.id} className="lms-detail">
                    <span className="lms-sym lms-sym--sm lms-sym--indigo text-[0.8125rem] font-semibold" aria-hidden="true">
                      {idx + 1}
                    </span>
                    <span className="lms-detail-label min-w-0 truncate">{sec.title}</span>
                    <span className="lms-detail-value whitespace-nowrap">
                      {sec.question_count ?? "?"} {sec.question_count === 1 ? "question" : "questions"}
                    </span>
                  </div>
                ))}
                <div className="lms-group-foot">
                  <p>
                    {canStart
                      ? quizGroup.time_limit_seconds
                        ? `The quiz opens full screen and the ${formatSeconds(quizGroup.time_limit_seconds)} timer starts when you press Start. Your answers save as you go.`
                        : "The quiz opens full screen. Your answers save as you go."
                      : deadlinePassed
                        ? "The deadline for this quiz has passed."
                        : "You have no attempts left for this quiz."}
                  </p>
                  {canStart && (
                    <button type="button" onClick={handleStart} disabled={starting} className="lms-btn lms-btn--sm">
                      {starting ? <IconSpinner className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                      {starting ? "Starting…" : "Start Quiz"}
                    </button>
                  )}
                </div>
              </div>
              {error && (
                <p role="alert" aria-live="assertive" className="lms-group-note !text-[#d92d20]">
                  {error}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {attempt && !focusOpen && (
        <Notice
          tone="blue"
          role="status"
          icon={<Clock className="h-4 w-4" />}
          title="Quiz in Progress"
          action={
            <button type="button" onClick={() => setFocusOpen(true)} className="lms-btn lms-btn--sm">
              <PlayCircle className="h-4 w-4" />
              Resume Quiz
            </button>
          }
        >
          {answeredCount} of {attemptQuestions.length} answered. Your answers are saved.
          {remainingMs != null && (
            <span className="mt-1 block font-medium text-ink">
              <span className="tabular-nums">{formatCountdown(remainingMs)}</span> left. The timer keeps running, and
              the quiz submits itself when it reaches zero.
            </span>
          )}
          {error && (
            <span role="alert" className="mt-1 block font-medium text-[#d92d20]">
              {error}
            </span>
          )}
        </Notice>
      )}

      {attempt && focusOpen && (
        <QuizFocusShell
          title={title}
          remainingMs={remainingMs}
          submitting={submitting}
          onSubmit={() => setConfirmOpen(true)}
          onLeave={() => setFocusOpen(false)}
          leaveNote={
            remainingMs != null
              ? "Your answers are saved, but the timer keeps running while you're away. The quiz submits itself when time runs out."
              : "Your answers are saved. You can come back and finish it later."
          }
          index={boundedQuestionIndex}
          total={attemptQuestions.length}
          onPrevious={() => setCurrentQuestionIndex((idx) => Math.max(idx - 1, 0))}
          onNext={() => setCurrentQuestionIndex((idx) => Math.min(idx + 1, attemptQuestions.length - 1))}
        >
          <div className="space-y-6">
            <div role="alert" aria-live="assertive" className="sr-only">
              {timeWarning}
            </div>

            {error && (
              <Notice tone="red" role="alert" icon={<AlertTriangle className="h-4 w-4" />} title="Something Went Wrong">
                {error}
              </Notice>
            )}

            {attemptQuestions.length > 0 && currentQuestionItem ? (
              <>
                {attempt.paraphrased && <RetryNote />}
                <QuestionProgress
                  index={boundedQuestionIndex}
                  total={attemptQuestions.length}
                  answered={answeredCount}
                  isAnswered={(idx) => (answers[attemptQuestions[idx].question.id] || []).length > 0}
                  onSelect={setCurrentQuestionIndex}
                />

                <div>
                  <p className="m-0 mb-1.5 text-[0.8125rem] font-semibold text-ink-3">
                    Section {currentQuestionItem.sectionIndex + 1} · {currentQuestionItem.sectionTitle}
                  </p>
                  <h2
                    id={`q-${currentQuestionItem.question.id}`}
                    className="m-0 font-[family-name:var(--font-roboto)] text-[1.1875rem] font-semibold leading-snug tracking-[-0.01em] text-ink sm:text-[1.3125rem]"
                  >
                    {currentQuestionItem.question.text}
                  </h2>
                  <p className="mb-3 mt-1.5 text-[0.8125rem] text-ink-3">
                    {currentQuestionItem.question.allow_multiple_answers
                      ? "Choose all that apply."
                      : "Choose one answer."}
                  </p>
                  <ChoiceList
                    name={currentQuestionItem.question.id}
                    multiple={currentQuestionItem.question.allow_multiple_answers === true}
                    options={currentQuestionItem.question.options}
                    selected={answers[currentQuestionItem.question.id] || []}
                    labelledBy={`q-${currentQuestionItem.question.id}`}
                    onToggle={(optId) =>
                      toggleOption(
                        currentQuestionItem.question.id,
                        optId,
                        currentQuestionItem.question.allow_multiple_answers === true,
                      )
                    }
                  />
                </div>
              </>
            ) : (
              <div className="lms-group p-6 text-center text-[0.9375rem] text-ink-2">
                There are no questions in this quiz yet.
              </div>
            )}
          </div>
        </QuizFocusShell>
      )}

      <ConfirmSubmitDialog
        // The timer can still expire while this is open; the auto-submit then takes over.
        open={confirmOpen && !!attempt}
        onOpenChange={setConfirmOpen}
        busy={submitting}
        title="Submit this quiz?"
        onConfirm={() => {
          setConfirmOpen(false);
          void handleSubmit(false);
        }}
      >
        {unansweredCount > 0
          ? `You have ${unansweredCount} unanswered question${
              unansweredCount === 1 ? "" : "s"
            }. They will be scored as 0.`
          : "All questions have an answer. You won't be able to change them after submitting."}
      </ConfirmSubmitDialog>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatSeconds(seconds: number) {
  return formatMinutes(Math.round(seconds / 60));
}
