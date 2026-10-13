import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { QuizEngine } from "@/components/learning/QuizEngine";
import { EssaySubmission } from "@/components/learning/EssaySubmission";
import { QuizGroupEngine } from "@/components/learning/QuizGroupEngine";
import { IconClipboardCheck } from "@/components/dashboard/icons";
import { MarkCompleteButton } from "@/components/learning/MarkCompleteButton";
import { DocumentDownloadButton } from "@/components/learning/DocumentDownloadButton";
import { LinkResourcePanel } from "@/components/learning/LinkResourcePanel";
import { LiveSessionPanel } from "@/components/learning/LiveSessionPanel";
import { LessonDescription } from "@/components/learning/LessonDescription";
import Link from "next/link";
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Lock } from "lucide-react";

type LearningNavItem = {
  id: string;
  title: string;
  item_type?: string | null;
  is_completed?: boolean | null;
};

type CurriculumSection = {
  id?: string;
  title?: string | null;
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
  let currentNavItem: LearningNavItem | null = null;
  let moduleNumber = 0;
  let moduleTitle: string | null = null;
  let positionInModule = 0;
  let moduleItemCount = 0;

  if (curriculum?.sections) {
    const allItems = curriculum.sections.flatMap(
      (sec: CurriculumSection) => sec.items || [],
    );
    const currentIndex = allItems.findIndex((i: LearningNavItem) => i.id === params.item_id);
    currentNavItem = currentIndex >= 0 ? allItems[currentIndex] : null;

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
    moduleNumber = currentSectionIndex + 1;
    moduleTitle = curriculum.sections[currentSectionIndex]?.title || null;
    moduleItemCount = currentSectionItems.length;
    isLastSection =
      currentSectionIndex !== -1 && currentSectionIndex === curriculum.sections.length - 1;

    const currentItemIndexInSection = currentSectionItems.findIndex(
      (i) => i.id === params.item_id,
    );
    positionInModule = currentItemIndexInSection + 1;
    const firstIncompleteIndex = currentSectionItems.findIndex((i) => !i.is_completed);
    const frontierIndex =
      firstIncompleteIndex === -1 ? currentSectionItems.length : firstIncompleteIndex;
    isSequentiallyLocked =
      currentNavItem?.item_type !== "LIVE_SESSION" &&
      currentItemIndexInSection !== -1 &&
      currentItemIndexInSection > frontierIndex;
    frontierItem =
      frontierIndex < currentSectionItems.length ? currentSectionItems[frontierIndex] : null;
  }

  if (itemRes.status === 403 || isSequentiallyLocked) {
    return (
      <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-3 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="text-lg font-semibold text-slate-950 dark:text-white">
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
          className="mt-2 inline-flex h-10 items-center gap-2 rounded-xl bg-[#2D6A4F] px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-14px_rgba(0,0,0,0.12)] shadow-[#2D6A4F]/20 transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
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
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f5f5f7] dark:bg-[#0a0c11]">
      {item.item_type === "VIDEO" && item.video_url && (
        <div className="z-20 w-full flex-shrink-0 bg-black">
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

      <div className="swcl-sidebar-scroll min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1040px] px-5 pb-32 pt-8 sm:px-8 sm:pt-12 lg:pb-12">
          <header className="mb-8 sm:mb-10">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-[#2D6A4F] dark:text-[#74c69d]">
              {moduleNumber > 0 ? (
                <>
                  <span>Module {moduleNumber}</span>
                  {moduleItemCount > 0 && (
                    <>
                      <span aria-hidden className="text-slate-300 dark:text-slate-600">·</span>
                      <span>
                        {positionInModule} of {moduleItemCount}
                      </span>
                    </>
                  )}
                </>
              ) : (
                <span>{itemLabel}</span>
              )}
            </p>

            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <h1 className="max-w-[760px] text-[1.875rem] font-semibold leading-[1.15] tracking-[-0.022em] text-slate-950 dark:text-white sm:text-[2.5rem]">
                {item.title}
              </h1>
              <div className="flex flex-shrink-0 flex-wrap items-center gap-2 sm:mt-2">
                {estimatedMinutes > 0 && (
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-black/[0.05] px-3 text-[0.8125rem] font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {formatMinutes(estimatedMinutes)}
                  </span>
                )}
                {item.is_completed && (
                  <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#2D6A4F]/10 px-3 text-[0.8125rem] font-semibold text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#95d5b2]">
                    <CheckCircle className="h-3.5 w-3.5" aria-hidden />
                    Complete
                  </span>
                )}
              </div>
            </div>

            {moduleTitle && moduleNumber > 0 && (
              <p className="mt-3 text-[0.9375rem] text-slate-500 dark:text-slate-400">
                {moduleTitle} · {itemLabel}
              </p>
            )}

            <LessonDescription text={item.item_description} />
          </header>

        {item.item_type === "DOCUMENT" && item.document_url && (
          <div className="flex h-[calc(100dvh-220px)] min-h-[420px] w-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.16)] ring-1 ring-black/[0.04] dark:bg-[#14171f] dark:ring-white/10">
            <div className="flex flex-shrink-0 flex-col gap-3 border-b border-black/[0.06] bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#14171f]/80 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#e7f6ee] text-[#2D6A4F] dark:bg-[#52b788]/15 dark:text-[#b7e4c7] [&>svg]:h-5 [&>svg]:w-5">
                  <IconClipboardCheck />
                </span>
                <h2 className="line-clamp-1 text-sm font-semibold text-slate-950 dark:text-white sm:text-base">{item.title}</h2>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                {item.downloadable === true && (
                  <DocumentDownloadButton
                    courseId={params.course_id}
                    itemId={item.id}
                  />
                )}
                <MarkCompleteButton
                  courseId={params.course_id}
                  itemId={item.id}
                  isCompleted={item.is_completed}
                  className="h-9"
                />
              </div>
            </div>
            <div className="w-full flex-1 bg-slate-100 dark:bg-[#0a0c11]">
              <iframe
                src={getDocumentViewerUrl(params.course_id, item.id, item.document_url)}
                title={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {item.item_type === "LINKS" && item.link_url && (
          <LinkResourcePanel
            courseId={params.course_id}
            itemId={item.id}
            title={item.title}
            url={item.link_url}
            label={item.link_label}
            description={item.link_description}
            isCompleted={item.is_completed}
          />
        )}

        {item.item_type === "LIVE_SESSION" && (
          <LiveSessionPanel
            courseId={params.course_id}
            item={item}
          />
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
          <div className="rounded-2xl border border-black/[0.06] bg-white p-5 text-center text-sm font-medium text-slate-600 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-14px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-[#14171f] dark:text-slate-300">
            This assessment type is not available yet.
          </div>
        )}

        {/* Course Navigation Footer */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {prevItem ? (
            <Link 
              href={`/learn/${params.course_id}/item/${prevItem.id}`}
              className="grid min-h-[68px] grid-cols-[20px_minmax(0,1fr)] items-center gap-3 rounded-2xl bg-white px-5 py-3 text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-14px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] transition-[box-shadow,transform] duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 hover:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_14px_30px_-14px_rgba(0,0,0,0.18)] dark:bg-[#14171f] dark:text-slate-300 dark:ring-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
              <div className="min-w-0 text-left">
                <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Previous</div>
                <div className="line-clamp-1 text-sm font-semibold">{prevItem.title}</div>
              </div>
            </Link>
          ) : <div className="hidden sm:block" />}
          
          {nextItem ? (
            item.is_completed ? (
              <Link
                href={`/learn/${params.course_id}/item/${nextItem.id}`}
                className="grid min-h-[68px] grid-cols-[minmax(0,1fr)_20px] items-center gap-3 rounded-2xl bg-[#2D6A4F] px-5 py-3 text-white shadow-[0_10px_24px_-12px_rgba(45,106,79,0.7)] transition-[background-color,transform] duration-150 hover:bg-[#245c43] active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
              >
                <div className="min-w-0 text-right">
                  <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-white/70 dark:text-[#1B4332]/70">Next</div>
                  <div className="line-clamp-1 text-sm font-semibold">{nextItem.title}</div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            ) : (
              <div
                className="grid min-h-[68px] cursor-not-allowed grid-cols-[minmax(0,1fr)_20px] items-center gap-3 rounded-2xl bg-black/[0.04] px-5 py-3 text-slate-400 dark:bg-white/5 dark:text-slate-500"
                aria-disabled="true"
              >
                <div className="min-w-0 text-right">
                  <div className="text-[0.68rem] font-semibold uppercase tracking-wide">Next</div>
                  <div className="line-clamp-1 text-sm font-semibold">
                    Complete this item to continue
                  </div>
                </div>
                <Lock className="h-5 w-5" />
              </div>
            )
          ) : item.is_completed ? (
            <Link
              href={`/dashboard/courses`}
              className="inline-flex min-h-[68px] items-center justify-center gap-3 rounded-2xl bg-[#2D6A4F] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(45,106,79,0.7)] transition hover:bg-[#245c43] dark:bg-[#52b788] dark:text-[#06130d] dark:hover:bg-[#74c69d]"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Finish Course</span>
            </Link>
          ) : (
            <div
              className="inline-flex min-h-[68px] cursor-not-allowed items-center justify-center gap-3 rounded-2xl bg-black/[0.04] px-5 py-3 text-sm font-semibold text-slate-400 dark:bg-white/5 dark:text-slate-500"
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

function getDocumentViewerUrl(courseId: string, itemId: string, documentUrl: string) {
  const proxiedUrl = `/api/proxy/courses/${courseId}/items/${itemId}/view`;

  if (documentUrl.toLowerCase().split("?")[0]?.endsWith(".pdf")) {
    return `${proxiedUrl}#toolbar=0&navpanes=0&scrollbar=0`;
  }

  return proxiedUrl;
}
