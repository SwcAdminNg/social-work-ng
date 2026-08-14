"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      : null
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
    
    setAnswers(prev => {
      const current = prev[qId] || [];
      if (allowMultiple) {
        return {
          ...prev,
          [qId]: current.includes(oId) ? current.filter(id => id !== oId) : [...current, oId]
        };
      } else {
        return { ...prev, [qId]: [oId] };
      }
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
      
      router.refresh(); // Update the sidebar checkmarks
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to submit quiz"));
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = questions.filter(q => answers[q.id] && answers[q.id].length > 0).length;
  const hasUnanswered = answeredCount < questions.length;
  const isFormDisabled = isReviewingResult || !canSubmit;
  const attemptLabel =
    effectiveAttemptsRemaining == null
      ? maxAttempts == null
        ? "Unlimited attempts"
        : `${maxAttempts} max attempts`
      : `${effectiveAttemptsRemaining} ${effectiveAttemptsRemaining === 1 ? "attempt" : "attempts"} remaining`;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {result && (
        <div className={`p-8 rounded-3xl text-center border shadow-sm ${
          result.resultVisible && result.passed 
            ? "bg-green-50 dark:bg-[#2D6A4F]/10 border-green-200 dark:border-[#2D6A4F]/30" 
            : result.resultVisible && result.passed === false
              ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30"
              : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30"
        }`}>
          <h2 className={`text-3xl font-extrabold mb-2 ${
            result.resultVisible && result.passed
              ? "text-[#2D6A4F] dark:text-[#52b788]"
              : result.resultVisible && result.passed === false
                ? "text-red-600 dark:text-red-400"
                : "text-blue-700 dark:text-blue-300"
          }`}>
            {result.resultVisible
              ? result.passed
                ? "Congratulations!"
                : "Keep Trying!"
              : "Quiz Submitted"}
          </h2>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {result.resultVisible && typeof result.score === "number"
              ? <>You scored <span className="font-bold">{result.score}%</span>.</>
              : "Your submission was recorded. Results are not available for this quiz."}
          </p>
          {result.message && !result.resultVisible && (
            <p className="mt-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
              {result.message}
            </p>
          )}
          {canSubmit && (
            <button
              onClick={() => { setResult(null); setAnswers(previousAttempt?.answers || {}); }}
              className={`mt-6 px-6 py-2.5 font-bold rounded-xl ${
                result.resultVisible && result.passed
                  ? "bg-[#2D6A4F] dark:bg-[#52b788] text-white dark:text-gray-900"
                  : "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
              }`}
            >
              {result.resultVisible && result.passed ? "Retake Quiz" : "Try Again"}
            </button>
          )}
        </div>
      )}

      {!result && isCompleted && !previousAttempt && (
        <div className="p-8 rounded-3xl text-center bg-green-50 dark:bg-[#2D6A4F]/10 border border-green-200 dark:border-[#2D6A4F]/30 shadow-sm">
          <h2 className="text-3xl font-extrabold text-[#2D6A4F] dark:text-[#52b788] mb-4">Quiz Passed!</h2>
          <p className="text-gray-600 dark:text-gray-300">You have already completed this quiz.</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Test Your Knowledge</h2>
          <div className="mb-8 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <span>{questions.length} questions</span>
            {typeof passMarkPercentage === "number" && <span>{passMarkPercentage}% pass mark</span>}
            {effectiveAttemptsUsed !== null && <span>{effectiveAttemptsUsed} used</span>}
            <span>{attemptLabel}</span>
            {deadline && <span>Due {deadline.toLocaleDateString()}</span>}
          </div>
          
          <div className="space-y-10">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  <span className="text-gray-400 mr-2">{idx + 1}.</span> {q.text}
                </h3>
                <div className="space-y-2 pl-6">
                  {q.options.map((opt) => {
                    const isSelected = (answers[q.id] || []).includes(opt.id);
                    return (
                        <label 
                          key={opt.id} 
                          className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                            isSelected 
                              ? "border-[#2D6A4F] bg-[#2D6A4F]/5 dark:bg-[#2D6A4F]/20" 
                              : "border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30"
                          } ${!isFormDisabled ? "cursor-pointer hover:border-gray-200 dark:hover:border-gray-700" : "opacity-90"}`}
                        >
                        <input
                          type={q.allow_multiple_answers ? "checkbox" : "radio"}
                          name={q.id}
                          checked={isSelected}
                          disabled={isFormDisabled}
                          onChange={() => toggleOption(q.id, opt.id, q.allow_multiple_answers === true)}
                          className={`mt-0.5 shrink-0 ${q.allow_multiple_answers ? "rounded text-[#2D6A4F]" : "text-[#2D6A4F]"} focus:ring-[#2D6A4F] ${isFormDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                        />
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!isFormDisabled && (
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center">
              {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full md:w-auto px-12 py-4 font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <IconSpinner className="w-5 h-5 animate-spin" /> : null}
                {submitting ? "Grading..." : "Submit Answers"}
              </button>
              {hasUnanswered && (
                <p className="text-sm text-gray-500 mt-3">Unanswered questions will be scored as 0.</p>
              )}
            </div>
          )}
          {!isReviewingResult && !canSubmit && (
            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                {deadlinePassed ? "The deadline for this quiz has passed." : "You have no attempts remaining for this quiz."}
              </p>
            </div>
          )}
        </div>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
