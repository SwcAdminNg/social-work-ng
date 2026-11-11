"use client";

import { ConfirmSubmitDialog } from "./ConfirmSubmitDialog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import { IconSpinner } from "@/components/auth/shared/icons";
import {
  ChoiceList,
  FinalAssessmentNotice,
  MetaPills,
  Notice,
  QuestionProgress,
  formatDue,
} from "./AssessmentParts";

interface QuizEngineProps {
  courseId: string;
  itemId: string;
  isCompleted: boolean;
  questions: QuizQuestion[];
  estimatedMinutes?: number | null;
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
  isFinalAssessment?: boolean | null;
  sectionFirstItemId?: string | null;
  isLastSection?: boolean;
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
  correctAnswers?: Record<string, string[]> | null;
  sectionReset?: boolean;
  courseReset?: boolean;
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
  isFinalAssessment,
  sectionFirstItemId,
  isLastSection,
}: QuizEngineProps) {
  const router = useRouter();
  const [currentTime] = useState(() => Date.now());
  const [answers, setAnswers] = useState<Record<string, string[]>>(previousAttempt?.answers || {});
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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

  // Once the server-provided attempts data reflects a submission (after router.refresh()),
  // drop the local session counter so we don't double-subtract the same attempt.
  const [prevAttemptsSnapshot, setPrevAttemptsSnapshot] = useState({ attemptsUsed, attemptsRemaining });
  if (prevAttemptsSnapshot.attemptsUsed !== attemptsUsed || prevAttemptsSnapshot.attemptsRemaining !== attemptsRemaining) {
    setPrevAttemptsSnapshot({ attemptsUsed, attemptsRemaining });
    setAttemptsUsedThisSession(0);
  }

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
        correctAnswers: data.data?.correct_answers ?? null,
        sectionReset: data.data?.section_reset === true,
        courseReset: data.data?.course_reset === true,
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = questions[currentQuestionIndex] || null;
  const canGoPrevious = currentQuestionIndex > 0;
  const canGoNext = currentQuestionIndex < questions.length - 1;
  const attemptLabel =
    effectiveAttemptsRemaining == null
      ? maxAttempts == null
        ? "Unlimited attempts"
        : `${maxAttempts} max attempts`
      : `${effectiveAttemptsRemaining} ${effectiveAttemptsRemaining === 1 ? "attempt" : "attempts"} remaining`;

  const isReset = result?.sectionReset || result?.courseReset;
  const resetHref = result?.courseReset
    ? `/learn/${courseId}`
    : sectionFirstItemId
      ? `/learn/${courseId}/item/${sectionFirstItemId}`
      : `/learn/${courseId}`;

  const showAnswers = Boolean(result?.resultVisible && result?.correctAnswers);
  const currentSelected = currentQuestion ? answers[currentQuestion.id] || [] : [];

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
          title={result.courseReset ? "Course Reset" : "Module Reset"}
          action={
            <button type="button" onClick={() => router.push(resetHref)} className="lms-btn lms-btn--sm">
              {result.courseReset ? "Restart Course" : "Restart Module"}
            </button>
          }
        >
          {result.message ||
            (result.courseReset
              ? "You're out of attempts, so the whole course has been reset."
              : "You're out of attempts, so this module has been reset.")}
        </Notice>
      )}

      {result && !isReset && (
        <Notice
          tone={result.resultVisible ? (result.passed ? "green" : "red") : "blue"}
          role="status"
          icon={
            result.resultVisible && result.passed === false ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )
          }
          title={
            result.resultVisible ? (result.passed ? "You Passed" : "Not Quite") : "Quiz Submitted"
          }
          action={
            canSubmit ? (
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setAnswers(previousAttempt?.answers || {});
                  setCurrentQuestionIndex(0);
                }}
                className="lms-btn lms-btn--sm lms-btn--tinted"
              >
                <RotateCcw className="h-4 w-4" />
                {result.resultVisible && result.passed ? "Retake" : "Try Again"}
              </button>
            ) : undefined
          }
        >
          {result.resultVisible && typeof result.score === "number" ? (
            <>
              You scored <strong className="font-semibold text-ink">{result.score}%</strong>
              {typeof passMarkPercentage === "number" ? ` · pass mark ${passMarkPercentage}%` : ""}.
              {showAnswers ? " Correct answers are marked below." : ""}
            </>
          ) : (
            result.message || "Your answers were recorded. Results aren't shown for this quiz."
          )}
        </Notice>
      )}

      {!result && isCompleted && !previousAttempt && (
        <Notice tone="green" icon={<CheckCircle2 className="h-4 w-4" />} title="Quiz Completed">
          You&apos;ve already completed this quiz.
        </Notice>
      )}

      <MetaPills
        items={[
          `${questions.length} ${questions.length === 1 ? "question" : "questions"}`,
          typeof passMarkPercentage === "number" && `${passMarkPercentage}% to pass`,
          attemptLabel,
          effectiveAttemptsUsed ? `${effectiveAttemptsUsed} used` : null,
          deadline && formatDue(deadline),
        ]}
      />

      {questions.length > 0 && currentQuestion ? (
        <div className="space-y-5">
          <QuestionProgress
            index={currentQuestionIndex}
            total={questions.length}
            answered={answeredCount}
            isAnswered={(idx) => (answers[questions[idx].id] || []).length > 0}
            onSelect={setCurrentQuestionIndex}
          />

          <div>
            <h2
              id={`q-${currentQuestion.id}`}
              className="m-0 font-[family-name:var(--font-roboto)] text-[1.1875rem] font-semibold leading-snug tracking-[-0.01em] text-ink sm:text-[1.3125rem]"
            >
              {currentQuestion.text}
            </h2>
            <p className="mb-3 mt-1.5 text-[0.8125rem] text-ink-3">
              {currentQuestion.allow_multiple_answers ? "Choose all that apply." : "Choose one answer."}
            </p>
            <ChoiceList
              name={currentQuestion.id}
              multiple={currentQuestion.allow_multiple_answers === true}
              options={currentQuestion.options}
              selected={currentSelected}
              disabled={isFormDisabled}
              labelledBy={`q-${currentQuestion.id}`}
              stateOf={
                showAnswers
                  ? (optId) => {
                      const correct = result?.correctAnswers?.[currentQuestion.id] || [];
                      if (correct.includes(optId)) return "correct";
                      if (currentSelected.includes(optId)) return "wrong";
                      return undefined;
                    }
                  : undefined
              }
              onToggle={(optId) =>
                toggleOption(currentQuestion.id, optId, currentQuestion.allow_multiple_answers === true)
              }
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex((idx) => Math.max(idx - 1, 0))}
              disabled={!canGoPrevious}
              className="lms-btn lms-btn--sm lms-btn--quiet"
            >
              <ChevronLeft className="-ml-1 h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentQuestionIndex((idx) => Math.min(idx + 1, questions.length - 1))}
              disabled={!canGoNext}
              className="lms-btn lms-btn--sm lms-btn--tinted"
            >
              Next
              <ChevronRight className="-mr-1 h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="lms-group p-6 text-center text-[0.9375rem] text-ink-2">
          There are no questions in this quiz yet.
        </div>
      )}

      {!isFormDisabled && questions.length > 0 && (
        <div className="lms-group">
          {error && (
            <p role="alert" aria-live="assertive" className="m-0 px-[1.1rem] pt-3.5 text-sm font-medium text-[#d92d20]">
              {error}
            </p>
          )}
          <div className="lms-group-foot !shadow-none">
            <p>
              {hasUnanswered
                ? `${questions.length - answeredCount} unanswered. Unanswered questions score 0.`
                : "Every question has an answer."}
            </p>
            <button type="button" onClick={() => setConfirmOpen(true)} disabled={submitting} className="lms-btn lms-btn--sm">
              {submitting ? <IconSpinner className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? "Submitting…" : "Submit Quiz"}
            </button>
          </div>
          <ConfirmSubmitDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            busy={submitting}
            title="Submit your quiz?"
            onConfirm={() => {
              setConfirmOpen(false);
              void handleSubmit();
            }}
          >
            {hasUnanswered
              ? `You have ${questions.length - answeredCount} unanswered question${
                  questions.length - answeredCount === 1 ? "" : "s"
                }. They will be scored as 0.`
              : "All questions have an answer. You won't be able to change them after submitting."}
          </ConfirmSubmitDialog>
        </div>
      )}

      {!isReviewingResult && !canSubmit && (
        <Notice tone="gold" icon={<Clock className="h-4 w-4" />} title="Quiz Closed">
          {deadlinePassed ? "The deadline for this quiz has passed." : "You have no attempts left for this quiz."}
        </Notice>
      )}
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
