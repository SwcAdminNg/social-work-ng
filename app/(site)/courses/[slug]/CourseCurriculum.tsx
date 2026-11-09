"use client";

import { useEffect, useState } from "react";
import { Boxes, CalendarDays, ChevronDown, Clock3, ExternalLink, Eye, FileText, HelpCircle, Layers, Link2, ListChecks, Lock, PlayCircle, X } from "lucide-react";
import { HlsVideoPlayer } from "@/components/learning/HlsVideoPlayer";
import { QuizEngine } from "@/components/learning/QuizEngine";

type CurriculumQuizQuestion = {
  id: string;
  text: string;
  allow_multiple_answers?: boolean | null;
  options: Array<{
    id: string;
    text: string;
  }>;
};

type CurriculumItem = {
  id: string;
  title: string;
  item_type?: string | null;
  assessment_type?: string | null;
  estimated_minutes?: number | null;
  is_preview?: boolean | null;
  video?: {
    playback_url?: string | null;
  } | null;
  document?: {
    file_name?: string | null;
    file_url?: string | null;
    content_url?: string | null;
    url?: string | null;
  } | null;
  document_url?: string | null;
  content_url?: string | null;
  quiz?: {
    questions?: CurriculumQuizQuestion[] | null;
  } | null;
  questions?: CurriculumQuizQuestion[] | null;
  link?: {
    url?: string | null;
    label?: string | null;
    description?: string | null;
  } | null;
  live_session?: {
    scheduled_start_at?: string | null;
    duration_minutes?: number | null;
    guest_name?: string | null;
    guest_title?: string | null;
    status?: string | null;
    recording_status?: string | null;
  } | null;
};

type CurriculumSection = {
  id: string;
  title: string;
  items?: CurriculumItem[] | null;
  guest_instructors?: GuestInstructor[] | null;
};

type GuestInstructor = {
  user_id?: string | null;
  name?: string | null;
  profile_picture_url?: string | null;
  is_guest?: boolean | null;
};

const TYPE_ICONS: Record<string, typeof FileText> = {
  VIDEO: PlayCircle,
  DOCUMENT: FileText,
  SCORM: Boxes,
  LINKS: Link2,
  LIVE_SESSION: CalendarDays,
  QUIZ: HelpCircle,
  ASSESSMENT: HelpCircle,
};

const TYPE_LABELS: Record<string, string> = {
  VIDEO: "Video",
  DOCUMENT: "Reading",
  SCORM: "Interactive lesson",
  LINKS: "Link",
  LIVE_SESSION: "Live session",
  QUIZ: "Quiz",
  ASSESSMENT: "Assessment",
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function CourseCurriculum({ courseId, sections }: { courseId?: string; sections: CurriculumSection[] }) {
  // The first section starts open so the outline never looks empty.
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() =>
    sections && sections.length > 0 ? { [sections[0].id]: true } : {},
  );
  const [previewItem, setPreviewItem] = useState<CurriculumItem | null>(null);

  // Escape closes the preview.
  useEffect(() => {
    if (!previewItem) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewItem(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [previewItem]);

  if (!sections || sections.length === 0) {
    return <p className="m-0 rounded-[24px] border border-dashed border-line bg-card p-8 text-ink-2">The outline for this course will appear here soon.</p>;
  }

  const allItems = sections.flatMap((section) => section.items || []);
  const totalMinutes = allItems.reduce((sum, item) => sum + (item.item_type === "LIVE_SESSION" ? 0 : getEstimatedMinutes(item)), 0);
  const previewCount = allItems.filter((item) => item.is_preview && !getLinkPayload(item)?.url && item.item_type !== "LIVE_SESSION").length;
  const allOpen = sections.every((section) => expandedSections[section.id]);

  const toggleSection = (id: string) => setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleAll = () => setExpandedSections(allOpen ? {} : Object.fromEntries(sections.map((section) => [section.id, true])));

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <ul className="m-0 flex list-none flex-wrap items-center gap-x-5 gap-y-1 p-0 text-[0.95rem] text-ink-2">
          <li className="flex items-center gap-2">
            <Layers size={16} className="text-accent" aria-hidden="true" />
            {plural(sections.length, "section")}
          </li>
          <li className="flex items-center gap-2">
            <ListChecks size={16} className="text-accent" aria-hidden="true" />
            {plural(allItems.length, "lesson")}
          </li>
          {totalMinutes > 0 && (
            <li className="flex items-center gap-2">
              <Clock3 size={16} className="text-accent" aria-hidden="true" />
              {formatMinutes(totalMinutes)}
            </li>
          )}
          {previewCount > 0 && (
            <li className="flex items-center gap-2 font-semibold text-clay-ink">
              <Eye size={16} aria-hidden="true" />
              {plural(previewCount, "free preview")}
            </li>
          )}
        </ul>
        {sections.length > 1 && (
          <button
            type="button"
            onClick={toggleAll}
            className="cursor-pointer rounded-full border-0 bg-transparent px-3 py-2 text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )}
      </div>

      <ol className="m-0 grid list-none gap-3 p-0">
        {sections.map((section, idx) => {
          const isExpanded = expandedSections[section.id] || false;
          const items = section.items || [];
          const minutes = items.reduce((sum, item) => sum + (item.item_type === "LIVE_SESSION" ? 0 : getEstimatedMinutes(item)), 0);
          const guestLabel = formatGuestInstructors(section.guest_instructors);
          const panelId = `outline-panel-${section.id}`;

          return (
            <li
              key={section.id}
              className={`overflow-hidden rounded-[24px] border bg-card transition-[border-color,box-shadow] duration-500 ${
                isExpanded ? "border-gold shadow-[0_30px_60px_-44px_rgba(14,31,23,0.5)]" : "border-line"
              }`}
            >
              <h3 className="m-0">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  className="group flex w-full cursor-pointer items-center gap-4 border-0 bg-transparent px-5 py-5 text-left text-ink md:gap-6 md:px-7"
                >
                  <span className="sw-em w-10 flex-none text-[2.1rem] leading-none text-clay-ink" aria-hidden="true">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="sw-title block text-[1.2rem] md:text-[1.35rem]">
                      <span className="sr-only">Section {idx + 1}: </span>
                      {section.title}
                    </span>
                    <span className="mt-1 block text-sm text-ink-3">
                      {plural(items.length, "lesson")}
                      {minutes > 0 && <> · {formatMinutes(minutes)}</>}
                    </span>
                    {guestLabel && <span className="mt-1 block text-sm font-semibold text-accent">{guestLabel}</span>}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`grid h-11 w-11 flex-none place-items-center rounded-full transition-all duration-500 ease-sw ${
                      isExpanded ? "rotate-180 bg-gold text-[#10231a]" : "bg-mint text-accent group-hover:bg-gold group-hover:text-[#10231a]"
                    }`}
                  >
                    <ChevronDown size={20} />
                  </span>
                </button>
              </h3>

              <div
                id={panelId}
                inert={!isExpanded ? true : undefined}
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-sw ${
                  isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <ul className="m-0 min-h-0 list-none overflow-hidden p-0">
                  {items.map((item) => {
                    const link = getLinkPayload(item);
                    const liveSessionMeta = getLiveSessionMeta(item);
                    const type = item.item_type?.toUpperCase() || "";
                    const Icon = TYPE_ICONS[type] ?? FileText;
                    const minutesLabel = getEstimatedMinutes(item) > 0 && type !== "LIVE_SESSION" ? formatMinutes(getEstimatedMinutes(item)) : null;

                    return (
                      <li
                        key={item.id}
                        className="flex flex-col gap-3 border-t border-line px-5 py-4 transition-colors duration-300 hover:bg-paper sm:flex-row sm:items-center sm:justify-between md:px-7"
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <span
                            className={`grid h-10 w-10 flex-none place-items-center rounded-xl ${
                              item.is_preview ? "bg-clay-wash text-clay-ink" : "bg-mint text-accent"
                            }`}
                            aria-hidden="true"
                          >
                            <Icon size={19} />
                          </span>
                          <div className="min-w-0">
                            <span className="block font-medium text-ink">{link?.label || item.title}</span>
                            {link?.description && <p className="m-0 mt-1 line-clamp-2 text-sm leading-5 text-ink-3">{link.description}</p>}
                            {liveSessionMeta && <p className="m-0 mt-1 line-clamp-2 text-sm leading-5 text-ink-3">{liveSessionMeta}</p>}
                            <span className="mt-1 block text-sm text-ink-3">
                              {getItemLabel(item)}
                              {minutesLabel && <> · {minutesLabel}</>}
                            </span>
                          </div>
                        </div>

                        <div className={`flex flex-none items-center pl-14 sm:pl-0 ${!link?.url && type !== "LIVE_SESSION" && !item.is_preview ? "max-sm:hidden" : ""}`}>
                          {link?.url ? (
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-mint px-4 text-sm font-semibold text-accent no-underline transition-colors hover:bg-gold hover:text-[#10231a]"
                            >
                              <ExternalLink size={15} aria-hidden="true" />
                              Open
                              <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          ) : type === "LIVE_SESSION" ? (
                            <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-mint px-4 text-sm font-semibold text-accent">
                              <CalendarDays size={15} aria-hidden="true" />
                              {getLiveSessionStatusLabel(item)}
                            </span>
                          ) : item.is_preview ? (
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border-0 bg-clay px-4 text-sm font-semibold text-white transition-transform duration-500 ease-sw hover:-translate-y-0.5"
                            >
                              <Eye size={15} aria-hidden="true" />
                              Preview
                              <span className="sr-only">: {item.title}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-sm text-ink-3" title="Available when you enrol">
                              <Lock size={14} aria-hidden="true" />
                              <span className="sr-only">Available when you enrol</span>
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Free preview */}
      {previewItem && (
        <div
          className="fixed inset-0 z-[1600] flex items-center justify-center bg-night/80 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Free preview: ${previewItem.title}`}
          data-lenis-prevent
          onClick={(event) => {
            if (event.target === event.currentTarget) setPreviewItem(null);
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-card shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
              <div className="min-w-0">
                <span className="sw-cap block text-clay-ink">Free preview</span>
                <h3 className="sw-title m-0 mt-1 line-clamp-1 text-xl text-ink">{previewItem.title}</h3>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setPreviewItem(null)}
                className="grid h-11 w-11 flex-none cursor-pointer place-items-center rounded-full border-0 bg-mint text-ink transition-colors hover:bg-gold hover:text-[#10231a]"
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex min-h-[400px] flex-1 items-center justify-center overflow-y-auto bg-black p-4 sm:p-6">
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
              ) : previewItem.item_type === "LINKS" ? (
                (() => {
                  const link = getLinkPayload(previewItem);
                  if (link?.url) {
                    return (
                      <div className="w-full max-w-xl rounded-xl bg-white p-6 text-left dark:bg-gray-900">
                        <Link2 className="mb-4 h-10 w-10 text-[#2D6A4F] dark:text-[#b7e4c7]" />
                        <h4 className="text-xl font-extrabold text-gray-900 dark:text-white">
                          {link.label || previewItem.title}
                        </h4>
                        {link.description && (
                          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                            {link.description}
                          </p>
                        )}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-[#2D6A4F] px-4 text-sm font-bold text-white transition hover:bg-[#1B4332] dark:bg-[#52b788] dark:text-[#06130d]"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open resource
                        </a>
                      </div>
                    );
                  }
                  return (
                    <div className="text-center text-gray-400">
                      <Link2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Link preview is not available.</p>
                    </div>
                  );
                })()
              ) : isQuizItem(previewItem) ? (
                getQuizQuestions(previewItem)?.length ? (
                  <div className="w-full bg-white dark:bg-gray-50 rounded-xl max-h-[75vh] overflow-y-auto p-4 md:p-6">
                    <QuizEngine
                      courseId={courseId || ""}
                      itemId={previewItem.id}
                      isCompleted={false}
                      questions={getQuizQuestions(previewItem) || []}
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

function isQuizItem(item: CurriculumItem) {
  return (
    item?.item_type === "QUIZ" ||
    (item?.item_type === "ASSESSMENT" && item?.assessment_type === "QUIZ")
  );
}

function getQuizQuestions(item: CurriculumItem) {
  return item?.questions || item?.quiz?.questions;
}

function getItemLabel(item: CurriculumItem) {
  const type = item?.item_type?.toUpperCase() || "";
  if (type === "ASSESSMENT" && item?.assessment_type) {
    const kind = item.assessment_type.toLowerCase().replace(/_/g, " ");
    return kind === "quiz" ? "Quiz" : `${kind.charAt(0).toUpperCase()}${kind.slice(1)} assessment`;
  }
  return TYPE_LABELS[type] ?? "Lesson";
}

function getLinkPayload(item: CurriculumItem) {
  if (item.item_type !== "LINKS") return null;
  return item.link || null;
}

function getLiveSessionMeta(item: CurriculumItem) {
  if (item.item_type !== "LIVE_SESSION") return null;

  const pieces = [
    formatDateTime(item.live_session?.scheduled_start_at),
    formatGuest(item.live_session?.guest_name, item.live_session?.guest_title),
  ].filter(Boolean);

  return pieces.join(" - ") || null;
}

function getLiveSessionStatusLabel(item: CurriculumItem) {
  const status = item.live_session?.status;
  if (status === "ENDED" && item.live_session?.recording_status === "READY") {
    return "Recording ready";
  }
  if (status === "ENDED") return "Ended";
  if (status === "CANCELLED") return "Cancelled";
  return "Scheduled";
}

function formatGuestInstructors(guests?: GuestInstructor[] | null) {
  const names = (guests || [])
    .map((guest) => guest.name?.trim())
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) return null;
  return `${names.length === 1 ? "Guest lecturer" : "Guest lecturers"}: ${names.join(", ")}`;
}

function getEstimatedMinutes(item: CurriculumItem) {
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

function formatDateTime(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatGuest(name?: string | null, title?: string | null) {
  const guestName = name?.trim();
  const guestTitle = title?.trim();
  if (!guestName) return null;
  return guestTitle ? `${guestName}, ${guestTitle}` : guestName;
}
