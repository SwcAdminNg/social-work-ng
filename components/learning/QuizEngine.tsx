"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSpinner } from "@/components/auth/shared/icons";

interface QuizEngineProps {
  courseId: string;
  itemId: string;
  isCompleted: boolean;
  questions: any[];
}

export function QuizEngine({ courseId, itemId, isCompleted, questions }: QuizEngineProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; score: number } | null>(null);
  const [error, setError] = useState("");

  const toggleOption = (qId: string, oId: string, allowMultiple: boolean) => {
    if (isCompleted || result?.passed) return;
    
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

      setResult({ passed: data.data?.passed, score: data.data?.score });
      
      if (data.data?.passed) {
        router.refresh(); // Update the sidebar checkmarks
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isAllAnswered = questions.every(q => answers[q.id] && answers[q.id].length > 0);

  if (isCompleted && !result) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center bg-green-50 dark:bg-[#2D6A4F]/10 rounded-3xl border border-green-200 dark:border-[#2D6A4F]/30">
        <h2 className="text-3xl font-extrabold text-[#2D6A4F] dark:text-[#52b788] mb-4">Quiz Passed!</h2>
        <p className="text-gray-600 dark:text-gray-300">You have already completed and passed this quiz. Great job!</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {result && (
        <div className={`p-8 rounded-3xl text-center border shadow-sm ${
          result.passed 
            ? "bg-green-50 dark:bg-[#2D6A4F]/10 border-green-200 dark:border-[#2D6A4F]/30" 
            : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30"
        }`}>
          <h2 className={`text-3xl font-extrabold mb-2 ${result.passed ? "text-[#2D6A4F] dark:text-[#52b788]" : "text-red-600 dark:text-red-400"}`}>
            {result.passed ? "Congratulations!" : "Keep Trying!"}
          </h2>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            You scored <span className="font-bold">{result.score}%</span>.
          </p>
          {!result.passed && (
            <button 
              onClick={() => { setResult(null); setAnswers({}); }}
              className="mt-6 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {(!result || !result.passed) && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Test Your Knowledge</h2>
          
          <div className="space-y-10">
            {questions.map((q, idx) => (
              <div key={q.id} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  <span className="text-gray-400 mr-2">{idx + 1}.</span> {q.text}
                </h3>
                <div className="space-y-2 pl-6">
                  {q.options.map((opt: any) => {
                    const isSelected = (answers[q.id] || []).includes(opt.id);
                    return (
                      <label 
                        key={opt.id} 
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? "border-[#2D6A4F] bg-[#2D6A4F]/5 dark:bg-[#2D6A4F]/20" 
                            : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30"
                        }`}
                      >
                        <input
                          type={q.allow_multiple_answers ? "checkbox" : "radio"}
                          name={q.id}
                          checked={isSelected}
                          onChange={() => toggleOption(q.id, opt.id, q.allow_multiple_answers)}
                          className={`mt-0.5 shrink-0 ${q.allow_multiple_answers ? "rounded text-[#2D6A4F]" : "text-[#2D6A4F]"} focus:ring-[#2D6A4F]`}
                        />
                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed">{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center">
            {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!isAllAnswered || submitting}
              className="w-full md:w-auto px-12 py-4 font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] rounded-xl shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <IconSpinner className="w-5 h-5 animate-spin" /> : null}
              {submitting ? "Grading..." : "Submit Answers"}
            </button>
            {!isAllAnswered && (
              <p className="text-sm text-gray-500 mt-3">Please answer all questions before submitting.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
