"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconChevronsLeft } from "@/components/dashboard/icons";
import { IconCheck } from "@/components/auth/shared/icons";
import { Menu, X, Star } from "lucide-react";
import { ReviewModal } from "./ReviewModal";

interface CourseSidebarProps {
  courseId: string;
  curriculum: any;
}

export function CourseSidebar({ courseId, curriculum }: CourseSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);

  const fetchUserReview = useCallback(async () => {
    try {
      const res = await fetch(`/api/proxy/courses/${courseId}/reviews/me`);
      if (res.ok) {
        const data = await res.json();
        if (data?.data?.id) {
          setUserReview(data.data);
          localStorage.setItem(`has_reviewed_${courseId}`, "true");
        }
      }
    } catch (e) {
      console.error("Failed to fetch user review", e);
    }
  }, [courseId]);

  useEffect(() => {
    fetchUserReview();
  }, [fetchUserReview]);

  const SidebarContent = (
    <div className="flex flex-col h-full overflow-hidden w-full bg-gray-50/50 dark:bg-gray-900/50">
      
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-950">
        <Link 
          href="/dashboard/courses"
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <IconChevronsLeft /> Back to Dashboard
        </Link>
        <button className="md:hidden p-2 text-gray-500" onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <h2 className="text-lg font-bold line-clamp-2 mb-2 leading-tight text-gray-900 dark:text-white">
          {curriculum.course_title || "Course Curriculum"}
        </h2>
        
        {/* Course Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          {(curriculum.total_reviews !== undefined && curriculum.total_reviews > 0) && (
            <>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < (curriculum.average_rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-gray-300 dark:text-gray-600"}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 ml-0.5">
                {Number(curriculum.average_rating).toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({curriculum.total_reviews} reviews)
              </span>
            </>
          )}
          <button 
            onClick={() => setIsReviewModalOpen(true)}
            className={`${curriculum.total_reviews > 0 ? "ml-auto" : "w-full justify-center"} flex text-xs font-semibold text-[#2D6A4F] hover:text-[#1B4332] dark:text-[#52b788] dark:hover:text-[#40916c] transition-colors bg-[#2D6A4F]/10 dark:bg-[#52b788]/10 px-2 py-1.5 rounded-md`}
          >
            {userReview ? "Edit Review" : "Rate & Review"}
          </button>
        </div>

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
                const itemUrl = `/learn/${courseId}/item/${item.id}`;
                const isActive = pathname === itemUrl;

                return (
                  <li key={item.id}>
                    <Link 
                      href={itemUrl}
                      className={`flex items-start gap-3 px-6 py-4 group border-l-4 transition-colors focus:outline-none ${
                        isActive 
                          ? "bg-white dark:bg-gray-800 border-[#2D6A4F]" 
                          : "border-transparent hover:bg-white dark:hover:bg-gray-800 hover:border-[#2D6A4F] focus:bg-white dark:focus:bg-gray-800 focus:border-[#2D6A4F]"
                      }`}
                    >
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                        isCompleted 
                          ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white' 
                          : isActive
                            ? 'border-[#2D6A4F] dark:border-[#52b788] text-transparent'
                            : 'border-gray-300 dark:border-gray-600 text-transparent'
                      }`}>
                        {isCompleted && <span className="w-3 h-3 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"><IconCheck /></span>}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium leading-snug transition-colors ${
                          isActive
                            ? "text-[#2D6A4F] dark:text-[#52b788] font-bold"
                            : isCompleted 
                              ? "text-gray-600 dark:text-gray-400 group-hover:text-[#2D6A4F] dark:group-hover:text-[#52b788]" 
                              : "text-gray-900 dark:text-gray-100 group-hover:text-[#2D6A4F] dark:group-hover:text-[#52b788]"
                        }`}>
                          {item.title}
                        </p>
                        <p className={`text-xs mt-1 uppercase tracking-wider font-semibold ${
                          isActive ? "text-[#2D6A4F]/70 dark:text-[#52b788]/70" : "text-gray-500"
                        }`}>
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
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-80 lg:w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 overflow-hidden z-10">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside 
        className={`md:hidden fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-white dark:bg-gray-950 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col overflow-hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Floating Action Button (Mobile Only) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 left-6 z-30 w-14 h-14 bg-[#2D6A4F] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1B4332] transition-transform active:scale-95"
      >
        <Menu className="w-6 h-6" />
      </button>

      <ReviewModal 
        courseId={courseId} 
        isOpen={isReviewModalOpen} 
        onOpenChange={setIsReviewModalOpen} 
        onDismiss={() => {}} 
        existingReview={userReview}
        onReviewSubmitted={() => {
          fetchUserReview();
          router.refresh();
        }}
      />
    </>
  );
}
