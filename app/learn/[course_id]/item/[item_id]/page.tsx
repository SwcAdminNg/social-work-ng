import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { QuizEngine } from "@/components/learning/QuizEngine";
import { EssaySubmission } from "@/components/learning/EssaySubmission";
import { QuizGroupEngine } from "@/components/learning/QuizGroupEngine";
import { MarkCompleteButton } from "@/components/learning/MarkCompleteButton";
import { DocumentDownloadButton } from "@/components/learning/DocumentDownloadButton";
import { LinkResourcePanel } from "@/components/learning/LinkResourcePanel";
import { LiveSessionPanel } from "@/components/learning/LiveSessionPanel";
import { LessonDescription } from "@/components/learning/LessonDescription";
import { ScormPlayer } from "@/components/learning/ScormPlayer";
import Link from "next/link";
import {
  AlertCircle,
  Award,
  BookOpen,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Link2,
  Lock,
  PlayCircle,
} from "lucide-react";

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
    const isModuleLocked = itemRes.status === 403;
    return (
      <div className="lms-scroll flex min-h-0 flex-1 overflow-y-auto">
        <div className="lms-unavailable lms-rise">
          <Lock strokeWidth={1.5} aria-hidden="true" />
          <h1>{isModuleLocked ? "Module Locked" : "Finish the Previous Lesson"}</h1>
          <p>
            {isModuleLocked
              ? "Pass the final assessment of the previous module to open this one."
              : "Lessons in a module open in order. Complete the earlier lessons to continue here."}
          </p>
          <Link
            href={
              isModuleLocked
                ? `/learn/${params.course_id}`
                : frontierItem
                  ? `/learn/${params.course_id}/item/${frontierItem.id}`
                  : `/learn/${params.course_id}`
            }
            className="lms-btn lms-btn--sm mt-3"
          >
            {isModuleLocked ? "Go to Current Lesson" : "Continue Where You Left Off"}
          </Link>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="lms-scroll flex min-h-0 flex-1 overflow-y-auto">
        <div className="lms-unavailable">
          <AlertCircle strokeWidth={1.5} aria-hidden="true" />
          <h1>Lesson Unavailable</h1>
          <p>This lesson could not be loaded. Check your connection and try again.</p>
          <Link href={`/learn/${params.course_id}/item/${params.item_id}`} className="lms-btn lms-btn--sm lms-btn--tinted mt-3">
            Try Again
          </Link>
        </div>
      </div>
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
  const hasVideo = item.item_type === "VIDEO" && item.video_url;

  return (
    <div className="lms-scroll min-h-0 flex-1 overflow-y-auto text-ink">
      {hasVideo && (
        <div className="w-full lg:px-8 lg:pt-6">
          <div className="lms-stage mx-auto w-full max-w-[1160px]">
            <VideoPlayer
              url={item.video_url}
              courseId={params.course_id}
              itemId={item.id}
              isCompleted={item.is_completed}
            />
          </div>
        </div>
      )}

      {/* Under a video the text lines up with the stage's left edge, as on Apple TV's episode pages. */}
      <div
        className={`mx-auto w-full px-5 pb-20 pt-7 sm:px-8 sm:pt-9 ${
          hasVideo ? "max-w-[1224px] [&>*]:max-w-[880px]" : "max-w-[880px]"
        }`}
      >
        <header className="lms-rise mb-8">
          <p className="m-0 text-[0.8125rem] font-semibold text-accent">
            {moduleNumber > 0 ? (
              <>
                Module {moduleNumber}
                {moduleItemCount > 0 && (
                  <span className="font-medium text-ink-3">
                    {" "}
                    · Lesson {positionInModule} of {moduleItemCount}
                  </span>
                )}
              </>
            ) : (
              itemLabel
            )}
          </p>

          <h1 className="m-0 mt-2 max-w-[760px] text-ink">{item.title}</h1>

          {moduleTitle && moduleNumber > 0 && (
            <p className="m-0 mt-2 text-[0.9375rem] text-ink-3">{moduleTitle}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="lms-pill">
              {getItemTypeIcon(item)}
              {itemLabel}
            </span>
            {estimatedMinutes > 0 && (
              <span className="lms-pill">
                <Clock aria-hidden="true" />
                {formatMinutes(estimatedMinutes)}
              </span>
            )}
            {item.is_completed && (
              <span className="lms-pill lms-pill--green">
                <CheckCircle2 aria-hidden="true" />
                Completed
              </span>
            )}
          </div>

          <LessonDescription text={item.item_description} />
        </header>

        {item.item_type === "DOCUMENT" && item.document_url && (
          <div className="lms-window h-[calc(100dvh-200px)] min-h-[440px] w-full">
            <div className="lms-window-bar">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="lms-sym lms-sym--sm lms-sym--blue" aria-hidden="true">
                  <FileText className="h-4 w-4" />
                </span>
                <h2 className="m-0 line-clamp-1 font-[family-name:var(--font-roboto)] text-sm font-semibold tracking-normal text-ink">
                  {item.title}
                </h2>
              </div>
              <div className="flex flex-shrink-0 items-start gap-2">
                {item.downloadable === true && (
                  <DocumentDownloadButton courseId={params.course_id} itemId={item.id} />
                )}
                <MarkCompleteButton
                  courseId={params.course_id}
                  itemId={item.id}
                  isCompleted={item.is_completed}
                />
              </div>
            </div>
            <div className="w-full flex-1 bg-[color-mix(in_srgb,var(--sw-ink)_5%,var(--sw-paper))]">
              <iframe
                src={getDocumentViewerUrl(params.course_id, item.id, item.document_url)}
                title={item.title}
                referrerPolicy="no-referrer"
                className="h-full w-full border-0"
              />
            </div>
          </div>
        )}

        {item.item_type === "SCORM" && (
          <ScormPlayer
            courseId={params.course_id}
            itemId={item.id}
            title={item.title}
            isCompleted={item.is_completed}
            scorm={item.scorm ?? {}}
          />
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
          <LiveSessionPanel courseId={params.course_id} item={item} />
        )}

        {isQuiz && item.questions && (
          <QuizEngine
            courseId={params.course_id}
            itemId={item.id}
            title={item.title}
            isCompleted={item.is_completed}
            questions={item.questions}
            paraphrased={item.quiz_paraphrased}
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
          <div className="lms-group p-6 text-center text-[0.9375rem] text-ink-2">
            This assessment type is not available yet.
          </div>
        )}

        {/* Up Next, as a grouped list: where you came from and where you go. */}
        <nav aria-label="Lesson navigation" className="mt-12">
          <h2 className="lms-group-head font-[family-name:var(--font-roboto)] tracking-normal">
            {nextItem ? "Up Next" : "Course"}
          </h2>
          <ul className="lms-group m-0 list-none p-0">
            {nextItem ? (
              <li>
                {item.is_completed ? (
                  <Link href={`/learn/${params.course_id}/item/${nextItem.id}`} className="lms-row">
                    <span className="lms-sym lms-sym--green" aria-hidden="true">
                      {getItemTypeIcon(nextItem, "h-[18px] w-[18px]")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-ink-3">Next lesson</span>
                      <span className="line-clamp-1 block text-[0.9375rem] font-semibold">{nextItem.title}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 flex-none text-ink-3" strokeWidth={2.4} aria-hidden="true" />
                  </Link>
                ) : (
                  <div className="lms-row" aria-disabled="true">
                    <span className="lms-sym lms-sym--gray" aria-hidden="true">
                      <Lock className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs">Complete this lesson to continue</span>
                      <span className="line-clamp-1 block text-[0.9375rem] font-semibold">{nextItem.title}</span>
                    </span>
                  </div>
                )}
              </li>
            ) : (
              <li>
                {item.is_completed ? (
                  <Link href="/dashboard/courses" className="lms-row">
                    <span className="lms-sym lms-sym--gold" aria-hidden="true">
                      <Award className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-ink-3">You reached the end</span>
                      <span className="block text-[0.9375rem] font-semibold">Finish Course</span>
                    </span>
                    <ChevronRight className="h-4 w-4 flex-none text-ink-3" strokeWidth={2.4} aria-hidden="true" />
                  </Link>
                ) : (
                  <div className="lms-row" aria-disabled="true">
                    <span className="lms-sym lms-sym--gray" aria-hidden="true">
                      <Lock className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs">Last lesson</span>
                      <span className="block text-[0.9375rem] font-semibold">Complete this lesson to finish the course</span>
                    </span>
                  </div>
                )}
              </li>
            )}
            {prevItem && (
              <li>
                <Link href={`/learn/${params.course_id}/item/${prevItem.id}`} className="lms-row">
                  <span className="lms-sym lms-sym--gray" aria-hidden="true">
                    <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2.4} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-ink-3">Previous lesson</span>
                    <span className="line-clamp-1 block text-[0.9375rem] font-semibold">{prevItem.title}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 flex-none text-ink-3" strokeWidth={2.4} aria-hidden="true" />
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}

function getItemTypeIcon(
  item: { item_type?: string | null },
  className = "",
) {
  const type = item.item_type;
  const props = { className, "aria-hidden": true as const };
  if (type === "VIDEO") return <PlayCircle {...props} />;
  if (type === "DOCUMENT") return <FileText {...props} />;
  if (type === "SCORM") return <Boxes {...props} />;
  if (type === "LINKS") return <Link2 {...props} />;
  if (type === "LIVE_SESSION") return <CalendarDays {...props} />;
  if (type === "ASSESSMENT" || type === "QUIZ" || type === "ESSAY") return <HelpCircle {...props} />;
  return <BookOpen {...props} />;
}

function getLearningItemLabel(item: LearningItemLabel) {
  if (item.item_type === "ASSESSMENT" && item.assessment_type) {
    return `${sentenceCase(item.assessment_type)} assessment`;
  }
  if (item.item_type === "SCORM") return "Interactive lesson";
  if (item.item_type === "LINKS") return "Link";
  if (item.item_type === "LIVE_SESSION") return "Live session";

  return sentenceCase(item.item_type);
}

function sentenceCase(value?: string | null) {
  if (!value) return "Lesson";
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
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
  return remainder > 0 ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function getDocumentViewerUrl(courseId: string, itemId: string, documentUrl: string) {
  const proxiedUrl = `/api/proxy/courses/${courseId}/items/${itemId}/view`;

  if (documentUrl.toLowerCase().split("?")[0]?.endsWith(".pdf")) {
    return `${proxiedUrl}#toolbar=0&navpanes=0&scrollbar=0`;
  }

  return proxiedUrl;
}
