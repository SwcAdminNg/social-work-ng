import { fetchApi } from "@/lib/fetchApi";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { IconChevronsLeft, IconBookOpen } from "@/components/dashboard/icons";
import { IconCheck } from "@/components/auth/shared/icons";

export default async function LearningLayout(props: { params: Promise<{ course_id: string }>, children: React.ReactNode }) {
  const params = await props.params;
  const res = await fetchApi(`/api/v1/learning/courses/${params.course_id}/curriculum`, { next: { revalidate: 0 } });
  
  if (res.status === 401) {
    redirect("/login");
  }
  if (res.status === 404) {
    notFound();
  }

  const data = await res.json().catch(() => ({}));
  const curriculum = data?.data;

  if (!curriculum) {
    return <div className="p-20 text-center text-red-500">Failed to load curriculum.</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      
      {/* Sidebar Curriculum */}
      <aside className="w-80 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 z-10">
        
        {/* Top Header */}
        <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <Link 
            href="/dashboard/courses"
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <IconChevronsLeft /> Back to Dashboard
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <h2 className="text-lg font-bold line-clamp-2 mb-4 leading-tight">{curriculum.course_title || "Course Curriculum"}</h2>
          <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
            <span>Course Progress</span>
            <span>{curriculum.progress_percent || 0}%</span>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2D6A4F] dark:bg-[#52b788] transition-all duration-500" 
              style={{ width: `${curriculum.progress_percent || 0}%` }}
            />
          </div>
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto">
          {curriculum.sections?.map((section: any, idx: number) => (
            <div key={section.id} className="border-b border-gray-200 dark:border-gray-800">
              <div className="px-6 py-4 bg-gray-100/50 dark:bg-gray-800/30 font-bold text-sm tracking-wide text-gray-700 dark:text-gray-300">
                Section {idx + 1}: {section.title}
              </div>
              <ul className="list-none m-0 p-0">
                {section.items?.map((item: any) => {
                  const isCompleted = item.is_completed;
                  return (
                    <li key={item.id}>
                      <Link 
                        href={`/learn/${params.course_id}/item/${item.id}`}
                        className="flex items-start gap-3 px-6 py-4 hover:bg-white dark:hover:bg-gray-800 transition-colors group border-l-4 border-transparent hover:border-[#2D6A4F] focus:outline-none focus:bg-white focus:border-[#2D6A4F]"
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isCompleted 
                            ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white' 
                            : 'border-gray-300 dark:border-gray-600 text-transparent'
                        }`}>
                          {isCompleted && <span className="w-3 h-3 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"><IconCheck /></span>}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium leading-snug group-hover:text-[#2D6A4F] transition-colors ${
                            isCompleted ? "text-gray-600 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
                          }`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
                            {item.item_type}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-100 dark:bg-gray-950">
        {props.children}
      </main>

    </div>
  );
}
