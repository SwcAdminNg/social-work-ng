import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { QuizEngine } from "@/components/learning/QuizEngine";
import { IconClipboardCheck } from "@/components/dashboard/icons";
import { MarkCompleteButton } from "@/components/learning/MarkCompleteButton";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

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

  let prevItem = null;
  let nextItem = null;

  if (curriculum?.sections) {
    const allItems = curriculum.sections.flatMap((sec: any) => sec.items || []);
    const currentIndex = allItems.findIndex((i: any) => i.id === params.item_id);
    
    if (currentIndex > 0) {
      prevItem = allItems[currentIndex - 1];
    }
    if (currentIndex !== -1 && currentIndex < allItems.length - 1) {
      nextItem = allItems[currentIndex + 1];
    }
  }

  if (!item) {
    return (
      <div className="p-20 text-center text-red-500">Failed to load item.</div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-white dark:bg-gray-950">
      {/* MEDIA AREA: Flush edge-to-edge on all screens like Udemy */}
      {item.item_type === "VIDEO" && item.video_url && (
        <div className="w-full shrink-0 z-20 shadow-md md:shadow-none bg-gray-50 dark:bg-gray-950">
          <div className="w-full mx-auto">
            <VideoPlayer
              url={item.video_url}
              courseId={params.course_id}
              itemId={item.id}
              isCompleted={item.is_completed}
            />
          </div>
        </div>
      )}

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-4 md:py-6 shrink-0 z-10 relative">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {item.title}
          </h1>
          <p className="text-xs font-semibold text-gray-500 mt-1.5 uppercase tracking-widest">
            {item.item_type}
          </p>
        </header>

        <div className="p-4 md:p-8 pb-32 max-w-5xl mx-auto">

        {item.item_type === "DOCUMENT" && item.document_url && (
          <div className="w-full h-[65vh] min-h-[500px] bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-blue-500 [&>svg]:w-full [&>svg]:h-full shrink-0">
                  <IconClipboardCheck />
                </span>
                <h2 className="font-bold text-gray-900 dark:text-white line-clamp-1">{item.title}</h2>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href={item.document_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Download
                </a>
                <MarkCompleteButton courseId={params.course_id} itemId={item.id} isCompleted={item.is_completed} />
              </div>
            </div>
            <div className="flex-1 w-full bg-gray-100 dark:bg-gray-950">
              <iframe 
                src={item.document_url.toLowerCase().endsWith('.pdf') ? item.document_url : `https://docs.google.com/viewer?url=${encodeURIComponent(item.document_url)}&embedded=true`} 
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}

        {item.item_type === "QUIZ" && item.questions && (
          <QuizEngine
            courseId={params.course_id}
            itemId={item.id}
            isCompleted={item.is_completed}
            questions={item.questions}
            previousAttempt={item.previous_attempt}
          />
        )}

        {/* Course Navigation Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 gap-4">
          {prevItem ? (
            <Link 
              href={`/learn/${params.course_id}/item/${prevItem.id}`}
              className="w-full sm:w-1/2 md:w-auto flex items-center justify-center sm:justify-start gap-3 px-6 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Previous</div>
                <div className="text-sm font-semibold line-clamp-1">{prevItem.title}</div>
              </div>
            </Link>
          ) : <div className="hidden sm:block sm:w-1/2 md:w-auto" />}
          
          {nextItem ? (
            <Link 
              href={`/learn/${params.course_id}/item/${nextItem.id}`}
              className="w-full sm:w-1/2 md:w-auto flex items-center justify-center sm:justify-end gap-3 px-6 py-4 bg-[#2D6A4F] text-white rounded-xl hover:bg-[#1B4332] font-medium shadow-md shadow-[#2D6A4F]/20 transition-colors"
            >
              <div className="text-right flex-1 min-w-0">
                <div className="text-xs text-[#52b788] uppercase tracking-wider font-bold">Next</div>
                <div className="text-sm font-semibold line-clamp-1">{nextItem.title}</div>
              </div>
              <ChevronRight className="w-5 h-5 shrink-0" />
            </Link>
          ) : (
            <Link
              href={`/dashboard/courses`}
              className="w-full sm:w-1/2 md:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-[#2D6A4F] text-white rounded-xl hover:bg-[#1B4332] font-medium shadow-md shadow-[#2D6A4F]/20 transition-colors"
            >
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span className="font-semibold">Finish Course</span>
            </Link>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
