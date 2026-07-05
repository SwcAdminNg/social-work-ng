import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";
import { VideoPlayer } from "@/components/learning/VideoPlayer";
import { QuizEngine } from "@/components/learning/QuizEngine";
import { IconClipboardCheck } from "@/components/dashboard/icons";

export default async function LearningItemPage(props: {
  params: Promise<{ course_id: string; item_id: string }>;
}) {
  const params = await props.params;
  const res = await fetchApi(
    `/learning/courses/${params.course_id}/items/${params.item_id}`,
    { next: { revalidate: 0 } },
  );

  if (res.status === 401) {
    redirect("/login");
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

        {item.item_type === "DOCUMENT" && (
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-12 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 text-center">
            <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-6">
              <span className="w-10 h-10 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                <IconClipboardCheck />
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-4">{item.title}</h2>
            <p className="text-gray-500 mb-8">
              Please review the attached document to continue.
            </p>
            {item.document_url && (
              <a
                href={item.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
              >
                Open Document
              </a>
            )}
          </div>
        )}

        {item.item_type === "QUIZ" && item.questions && (
          <QuizEngine
            courseId={params.course_id}
            itemId={item.id}
            isCompleted={item.is_completed}
            questions={item.questions}
          />
        )}
      </div>
    </div>
  );
}
