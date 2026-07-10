"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, PlayCircle, FileText, HelpCircle, X, Eye } from "lucide-react";
import { HlsVideoPlayer } from "@/components/learning/HlsVideoPlayer";
import { QuizEngine } from "@/components/learning/QuizEngine";

export function CourseCurriculum({ courseId, sections }: { courseId?: string; sections: any[] }) {
  // Store expanded state for each section ID. Initialize the first section as expanded.
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    if (sections && sections.length > 0) {
      initialState[sections[0].id] = true;
    }
    return initialState;
  });

  const [previewItem, setPreviewItem] = useState<any | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getItemIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case "VIDEO":
        return <PlayCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
      case "DOCUMENT":
        return <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
      case "QUIZ":
        return <HelpCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
  };

  if (!sections || sections.length === 0) {
    return <p className="text-gray-500">No curriculum available yet.</p>;
  }

  return (
    <>
      <div className="space-y-4">
        {sections.map((section: any, idx: number) => {
          const isExpanded = expandedSections[section.id] || false;
          const itemCount = section.items?.length || 0;

          return (
            <div
              key={section.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm transition-all duration-200"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                aria-expanded={isExpanded}
              >
                <div className="flex flex-col text-left">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    Section {idx + 1}: {section.title}
                  </h3>
                  <span className="text-sm text-gray-500 mt-1">
                    {itemCount} {itemCount === 1 ? "lectures" : "lectures"}
                  </span>
                </div>
                <div className="flex-shrink-0 ml-4 text-gray-500">
                  {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </div>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <ul className="overflow-hidden min-h-0 divide-y divide-gray-100 dark:divide-gray-800/50 bg-white dark:bg-gray-900">
                  {section.items?.map((item: any) => (
                    <li
                      key={item.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        {getItemIcon(item.item_type)}
                        <span className={`font-medium ${item.is_preview ? "text-[#2D6A4F] dark:text-[#52b788]" : "text-gray-700 dark:text-gray-300"}`}>
                          {item.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {item.is_preview ? (
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="flex items-center gap-1.5 text-sm font-bold text-[#F4A261] hover:text-[#d98b4f] transition-colors bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {item.item_type}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal Overlay */}
      {previewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#F4A261] uppercase tracking-wider mb-1">
                  Free Preview
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                  {previewItem.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors focus:outline-none"
                aria-label="Close preview"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-black flex items-center justify-center min-h-[400px]">
              {previewItem.item_type === "VIDEO" ? (
                previewItem.video?.playback_url ? (
                  <div className="w-full aspect-video">
                    <HlsVideoPlayer 
                      url={previewItem.video.playback_url}
                      className="w-full h-full rounded-xl bg-black"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Video content is processing or unavailable.</p>
                  </div>
                )
              ) : previewItem.item_type === "DOCUMENT" ? (
                (() => {
                  const docUrl = previewItem.document?.file_url || previewItem.document?.content_url || previewItem.document?.url || previewItem.document_url || previewItem.content_url;
                  if (docUrl) {
                    return (
                      <iframe
                        src={docUrl.toLowerCase().endsWith('.pdf') ? docUrl : `https://docs.google.com/viewer?url=${encodeURIComponent(docUrl)}&embedded=true`}
                        className="w-full h-[600px] bg-white rounded-xl"
                        title={previewItem.title}
                      />
                    );
                  }
                  return (
                    <div className="text-center text-gray-400 bg-gray-900 rounded-xl p-12 border border-gray-800">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h4 className="text-white text-xl font-bold mb-2">{previewItem.document?.file_name || previewItem.title}</h4>
                      <p>This document is available for preview, but the file link is not provided by the server.</p>
                    </div>
                  );
                })()
              ) : previewItem.item_type === "QUIZ" ? (
                previewItem.quiz?.questions ? (
                  <div className="w-full bg-white dark:bg-gray-50 rounded-xl max-h-[75vh] overflow-y-auto p-4 md:p-6">
                    <QuizEngine
                      courseId={courseId || ""}
                      itemId={previewItem.id}
                      isCompleted={false}
                      questions={previewItem.quiz.questions}
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Quiz preview is not available.</p>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-400">
                  <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Preview is not available for this item type.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
