import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { QuizEngine } from "@/components/learning/QuizEngine";
import { IconClipboardCheck } from "@/components/dashboard/icons";
import { MarkCompleteButton } from "@/components/learning/MarkCompleteButton";

export default async function LearningItemPage(props: {
  params: Promise<{ course_id: string; item_id: string }>;
}) {
  const params = await props.params;
  const res = await fetchApi(
    `/learning/courses/${params.course_id}/items/${params.item_id}`,
    { next: { revalidate: 0 } },
  );

  if (res.status === 401) {
    redirect(`/logout?callbackUrl=/learn/${params.course_id}/item/${params.item_id}`);
  }
  if (res.status === 404) {
    notFound();
  }

  const data = await res.json().catch(() => ({}));
  const item = data?.data;

  if (!item) {
    return (
      <div className="p-20 text-center text-red-500">Failed to load item.</div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 shrink-0 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {item.title}
        </h1>
        <p className="text-sm font-semibold text-gray-400 mt-1 uppercase tracking-widest">
          {item.item_type}
        </p>
      </header>

      {/* Content Area */}
      <div className="p-8 pb-32">
        {item.item_type === "VIDEO" && item.video_url && (
          <VideoPlayer
            url={item.video_url}
            courseId={params.course_id}
            itemId={item.id}
            isCompleted={item.is_completed}
          />
        )}

        {item.item_type === "DOCUMENT" && item.document_url && (
          <div className="max-w-5xl mx-auto h-[75vh] min-h-[600px] bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-5 h-5 text-blue-500 [&>svg]:w-full [&>svg]:h-full">
                  <IconClipboardCheck />
                </span>
                <h2 className="font-bold text-gray-900 dark:text-white">{item.title}</h2>
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
      </div>
    </div>
  );
}
