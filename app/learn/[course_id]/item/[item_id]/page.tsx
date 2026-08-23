import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { QuizEngine } from "@/components/learning/QuizEngine";
import { EssaySubmission } from "@/components/learning/EssaySubmission";
import { QuizGroupEngine } from "@/components/learning/QuizGroupEngine";
import { IconClipboardCheck } from "@/components/dashboard/icons";
import { MarkCompleteButton } from "@/components/learning/MarkCompleteButton";
import Link from "next/link";
import { CheckCircle, ChevronLeft, ChevronRight, Download, Lock } from "lucide-react";

type LearningNavItem = {
  id: string;
  title: string;
  is_completed?: boolean | null;
};

type CurriculumSection = {
  id?: string;
  items?: LearningNavItem[] | null;
};

type LearningItemLabel = {
  item_type?: string | null;
  assessment_type?: string | null;
  estimated_minutes?: number | null;
};

export default async function LearningItemPage(props: {
  params: Promise<{ course_id: string; item_id: string }>;
}) {
  const params = await props.params;
  const [itemRes, curriculumRes] = await Promise.all([
    fetchApi(`/learning/courses/${params.course_id}/items/${params.item_id}`, { next: { revalidate: 0 } }),
    fetchApi(`/learning/courses/${params.course_id}/curriculum`, { next: { revalidate: 0 } })
  ]);

  if (itemRes.status === 401) {
    redirect(`/logout?callbackUrl=/learn/${params.course_id}/item/${params.item_id}`);
  }
  if (itemRes.status === 404) {
    notFound();
  }

  const [itemData, currData] = await Promise.all([
    itemRes.json().catch(() => ({})),
    curriculumRes.json().catch(() => ({}))
  ]);

  const item = itemData?.data;
  const curriculum = currData?.data;

  let prevItem: LearningNavItem | null = null;
  let nextItem: LearningNavItem | null = null;
  let sectionFirstItemId: string | null = null;
  let isLastSection = false;
  let isSequentiallyLocked = false;
  let frontierItem: LearningNavItem | null = null;

  if (curriculum?.sections) {
    const allItems = curriculum.sections.flatMap(
      (sec: CurriculumSection) => sec.items || [],
    );
    const currentIndex = allItems.findIndex((i: LearningNavItem) => i.id === params.item_id);

    if (currentIndex > 0) {
      prevItem = allItems[currentIndex - 1];
    }
    if (currentIndex !== -1 && currentIndex < allItems.length - 1) {
      nextItem = allItems[currentIndex + 1];
    }

    const currentSectionIndex = curriculum.sections.findIndex((sec: CurriculumSection) =>
      (sec.items || []).some((i) => i.id === params.item_id),
    );
    const currentSectionItems: LearningNavItem[] =
      curriculum.sections[currentSectionIndex]?.items || [];
    sectionFirstItemId = currentSectionItems[0]?.id || null;
    isLastSection =
      currentSectionIndex !== -1 && currentSectionIndex === curriculum.sections.length - 1;

    const currentItemIndexInSection = currentSectionItems.findIndex(
      (i) => i.id === params.item_id,
    );
    const firstIncompleteIndex = currentSectionItems.findIndex((i) => !i.is_completed);
    const frontierIndex =
      firstIncompleteIndex === -1 ? currentSectionItems.length : firstIncompleteIndex;
    isSequentiallyLocked =
      currentItemIndexInSection !== -1 && currentItemIndexInSection > frontierIndex;
    frontierItem =
      frontierIndex < currentSectionItems.length ? currentSectionItems[frontierIndex] : null;
  }

  if (itemRes.status === 403 || isSequentiallyLocked) {
    return (
      <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-3 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="text-lg font-extrabold text-slate-950 dark:text-white">
          {itemRes.status === 403 ? "Module locked" : "Complete previous items first"}
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {itemRes.status === 403
            ? "This module is locked - pass the previous module's final assessment first."
            : "You need to finish the earlier items in this module before you can move on to this one."}
        </p>
        <Link
          href={
            itemRes.status === 403
              ? `/learn/${params.course_id}`
              : frontierItem
                ? `/learn/${params.course_id}/item/${frontierItem.id}`
                : `/learn/${params.course_id}`
          }
          className="mt-2 inline-flex h-10 items-center gap-2 rounded-md bg-[#2D6A4F] px-4 text-sm font-extrabold text-white shadow-sm shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
        >
          {itemRes.status === 403 ? "Back to course" : "Continue where you left off"}
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-20 text-center text-red-500">Failed to load item.</div>
    );
  }

  const itemLabel = getLearningItemLabel(item);
  const estimatedMinutes = getEstimatedMinutes(item);
  const isQuiz =
    item.item_type === "QUIZ" ||
    (item.item_type === "ASSESSMENT" && item.assessment_type === "QUIZ");
  const isEssay =
    item.item_type === "ESSAY" ||
    (item.item_type === "ASSESSMENT" && item.assessment_type === "ESSAY");
  const isQuizGroup =
    item.item_type === "ASSESSMENT" && item.assessment_type === "QUIZ_GROUP";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f7fcf9] dark:bg-[#0b1220]">
      {item.item_type === "VIDEO" && item.video_url && (
        <div className="z-20 w-full flex-shrink-0 border-b border-[#dceee4] bg-slate-950 shadow-sm dark:border-[#27433a]">
          <div className="mx-auto w-full max-w-[1180px]">
            <VideoPlayer
              url={item.video_url}
              courseId={params.course_id}
              itemId={item.id}
              isCompleted={item.is_completed}
            />
          </div>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-[#dceee4] bg-white/92 px-4 py-3 backdrop-blur dark:border-[#27433a] dark:bg-[#111525]/92 sm:px-5 lg:px-7">
          <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#e7f6ee] px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-wide text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7]">
                  {itemLabel}
                </span>
                {estimatedMinutes > 0 && (
                  <span className="rounded-md border border-[#b7e4c7] px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-wide text-[#2D6A4F] dark:border-[#27433a] dark:text-[#b7e4c7]">
                    {formatMinutes(estimatedMinutes)}
                  </span>
                )}
                {item.is_completed && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-[#b7e4c7] px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-wide text-[#2D6A4F] dark:border-[#27433a] dark:text-[#b7e4c7]">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Complete
                  </span>
                )}
              </div>
              <h1 className="line-clamp-2 text-lg font-extrabold leading-6 text-slate-950 dark:text-white sm:text-xl">
                {item.title}
              </h1>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1040px] px-4 py-4 pb-28 sm:px-5 sm:py-5 lg:px-7 lg:pb-8">

        {item.item_type === "DOCUMENT" && item.document_url && (
          <div className="flex h-[calc(100dvh-180px)] min-h-[420px] w-full flex-col overflow-hidden rounded-lg border border-[#dceee4] bg-white shadow-sm dark:border-[#27433a] dark:bg-[#111525]">
            <div className="flex flex-shrink-0 flex-col gap-3 border-b border-[#dceee4] bg-[#fbfefd] px-4 py-3 dark:border-[#27433a] dark:bg-[#0f1726] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7] [&>svg]:h-5 [&>svg]:w-5">
                  <IconClipboardCheck />
                </span>
                <h2 className="line-clamp-1 text-sm font-extrabold text-slate-950 dark:text-white sm:text-base">{item.title}</h2>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <a 
                  href={item.document_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[#b7e4c7] px-3 text-sm font-bold text-[#2D6A4F] transition hover:bg-[#f0fbf5] dark:border-[#27433a] dark:text-[#b7e4c7] dark:hover:bg-[#183026]"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
                <MarkCompleteButton
                  courseId={params.course_id}
                  itemId={item.id}
                  isCompleted={item.is_completed}
                  className="h-9"
                />
              </div>
            </div>
            <div className="w-full flex-1 bg-slate-100 dark:bg-[#0b1220]">
              <iframe 
                src={item.document_url.toLowerCase().endsWith('.pdf') ? item.document_url : `https://docs.google.com/viewer?url=${encodeURIComponent(item.document_url)}&embedded=true`} 
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {isQuiz && item.questions && (
          <QuizEngine
            courseId={params.course_id}
            itemId={item.id}
            isCompleted={item.is_completed}
            questions={item.questions}
            estimatedMinutes={estimatedMinutes}
            maxAttempts={item.max_attempts}
            attemptsUsed={item.attempts_used}
            attemptsRemaining={item.attempts_remaining}
            passMarkPercentage={item.pass_mark_percentage}
            dueDate={item.due_date}
            previousAttempt={item.previous_attempt}
            isFinalAssessment={item.is_final_assessment}
            sectionFirstItemId={sectionFirstItemId}
            isLastSection={isLastSection}
          />
        )}

        {isEssay && (
          <EssaySubmission
            courseId={params.course_id}
            itemId={item.id}
            essayQuestion={item.essay_question}
            essayDescription={item.essay_description}
            estimatedMinutes={estimatedMinutes}
            submissionMode={item.essay_submission_mode}
            dueDate={item.due_date}
            submission={item.essay_submission}
            isFinalAssessment={item.is_final_assessment}
            maxAttempts={item.essay_max_attempts}
            attemptsUsed={item.essay_attempts_used}
            attemptsRemaining={item.essay_attempts_remaining}
            passMarkPercentage={item.essay_pass_mark_percentage}
            isLastSection={isLastSection}
          />
        )}

        {isQuizGroup && item.quiz_group && (
          <QuizGroupEngine
            courseId={params.course_id}
            itemId={item.id}
            title={item.title}
            estimatedMinutes={estimatedMinutes}
            dueDate={item.due_date}
            isFinalAssessment={item.is_final_assessment}
            sectionFirstItemId={sectionFirstItemId}
            isLastSection={isLastSection}
            quizGroup={item.quiz_group}
          />
        )}

        {item.item_type === "ASSESSMENT" && !isQuiz && !isEssay && !isQuizGroup && (
          <div className="rounded-lg border border-[#dceee4] bg-white p-5 text-center text-sm font-medium text-slate-600 shadow-sm dark:border-[#27433a] dark:bg-[#111525] dark:text-slate-300">
            This assessment type is not available yet.
          </div>
        )}

        {/* Course Navigation Footer */}
        <div className="mt-5 grid gap-3 border-t border-[#dceee4] pt-4 dark:border-[#27433a] sm:grid-cols-2">
          {prevItem ? (
            <Link 
              href={`/learn/${params.course_id}/item/${prevItem.id}`}
              className="grid min-h-16 grid-cols-[20px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-[#dceee4] bg-white px-4 py-3 text-slate-700 transition hover:bg-[#f0fbf5] hover:text-[#2D6A4F] dark:border-[#27433a] dark:bg-[#111525] dark:text-slate-300 dark:hover:bg-[#183026] dark:hover:text-[#b7e4c7]"
            >
              <ChevronLeft className="h-5 w-5" />
              <div className="min-w-0 text-left">
                <div className="text-[0.68rem] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">Previous</div>
                <div className="line-clamp-1 text-sm font-extrabold">{prevItem.title}</div>
              </div>
            </Link>
          ) : <div className="hidden sm:block" />}
          
          {nextItem ? (
            item.is_completed ? (
              <Link
                href={`/learn/${params.course_id}/item/${nextItem.id}`}
                className="grid min-h-16 grid-cols-[minmax(0,1fr)_20px] items-center gap-3 rounded-lg bg-[#2D6A4F] px-4 py-3 text-white shadow-sm shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
              >
                <div className="min-w-0 text-right">
                  <div className="text-[0.68rem] font-extrabold uppercase tracking-wide text-white/70 dark:text-[#1B4332]/70">Next</div>
                  <div className="line-clamp-1 text-sm font-extrabold">{nextItem.title}</div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            ) : (
              <div
                className="grid min-h-16 cursor-not-allowed grid-cols-[minmax(0,1fr)_20px] items-center gap-3 rounded-lg border border-[#dceee4] bg-slate-50 px-4 py-3 text-slate-400 dark:border-[#27433a] dark:bg-[#111525] dark:text-slate-500"
                aria-disabled="true"
              >
                <div className="min-w-0 text-right">
                  <div className="text-[0.68rem] font-extrabold uppercase tracking-wide">Next</div>
                  <div className="line-clamp-1 text-sm font-extrabold">
                    Complete this item to continue
                  </div>
                </div>
                <Lock className="h-5 w-5" />
              </div>
            )
          ) : item.is_completed ? (
            <Link
              href={`/dashboard/courses`}
              className="inline-flex min-h-16 items-center justify-center gap-3 rounded-lg bg-[#2D6A4F] px-4 py-3 text-sm font-extrabold text-white shadow-sm shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Finish Course</span>
            </Link>
          ) : (
            <div
              className="inline-flex min-h-16 cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-[#dceee4] bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-400 dark:border-[#27433a] dark:bg-[#111525] dark:text-slate-500"
              aria-disabled="true"
            >
              <Lock className="h-5 w-5" />
              <span>Complete this item to finish the course</span>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

function getLearningItemLabel(item: LearningItemLabel) {
  if (item.item_type === "ASSESSMENT" && item.assessment_type) {
    return `${item.assessment_type} ASSESSMENT`;
  }

  return item.item_type;
}

function getEstimatedMinutes(item: LearningItemLabel) {
  return typeof item.estimated_minutes === "number" && item.estimated_minutes > 0
    ? item.estimated_minutes
    : 0;
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}
