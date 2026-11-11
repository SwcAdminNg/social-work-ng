"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FilePenLine,
  Hourglass,
  Layers,
  ListChecks,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

export type AssessmentTab =
  | "upcoming"
  | "submitted"
  | "results"
  | "completed"
  | "retakes";

export type AssessmentStats = {
  upcoming_count: number;
  completed_count: number;
  average_score_percentage: number | null;
  retakes_available_count: number;
};

export type AssessmentDateRange = {
  startDate: string;
  endDate: string;
  label: string;
};

export type UserAssessment = {
  item_id: string;
  title: string;
  course_id: string;
  course_title: string;
  assessment_type: "QUIZ" | "ESSAY" | "QUIZ_GROUP" | string;
  due_date: string | null;
  status: string;
  score: number | null;
  last_activity_at: string | null;
  estimated_minutes?: number | null;
  max_attempts?: number | null;
  attempts_used?: number | null;
  attempts_remaining?: number | null;
  pass_mark_percentage?: number | null;
  is_graded?: boolean | null;
  is_published?: boolean | null;
  result_status?: string | null;
};

const TABS: { id: AssessmentTab; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "submitted", label: "Submitted" },
  { id: "results", label: "Results" },
  { id: "retakes", label: "Retakes" },
];

export default function AssessmentsList({
  assessments,
  stats,
  upcomingAssessments,
  completedAssessments,
  totalItems,
  totalPages,
  currentPage,
  currentTab,
  pageSize,
  assessmentType,
  dateRange,
  error,
}: {
  assessments: UserAssessment[];
  stats: AssessmentStats;
  upcomingAssessments: UserAssessment[];
  completedAssessments: UserAssessment[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  currentTab: AssessmentTab;
  pageSize: number;
  assessmentType: "QUIZ" | "ESSAY" | "QUIZ_GROUP" | null;
  dateRange: AssessmentDateRange | null;
  error: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const visibleAssessments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base =
      currentTab === "results"
        ? assessments.filter((assessment) =>
            ["PASSED", "FAILED", "GRADED"].includes(
              assessment.status?.toUpperCase(),
            ),
          )
        : assessments;

    if (!normalizedQuery) return base;

    return base.filter((assessment) =>
      [assessment.title, assessment.course_title, assessment.assessment_type]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [assessments, currentTab, query]);

  const calendarItems = useMemo(
    () => mergeByItemId([...upcomingAssessments, ...completedAssessments]),
    [upcomingAssessments, completedAssessments],
  );

  const showingStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingEnd = Math.min(currentPage * pageSize, totalItems);

  function updateParam(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/dashboard/assessments?${params.toString()}`);
  }

  function changeTab(tab: AssessmentTab) {
    updateParam({ tab, page: "1" });
  }

  function changePage(page: number) {
    if (page < 1 || page > Math.max(totalPages, 1)) return;
    updateParam({ page: String(page) });
  }

  function clearDateRange() {
    updateParam({ start_date: null, end_date: null, page: "1" });
  }

  const average =
    stats.average_score_percentage === null ? null : Math.round(stats.average_score_percentage);
  const summary = [
    stats.upcoming_count > 0 ? `${stats.upcoming_count} coming up` : "Nothing due",
    `${stats.completed_count} completed`,
    average !== null ? `${average}% average` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col pb-8">
      <header className="lms-rise pt-1">
        <h1 className="sw-display m-0 text-[clamp(1.9rem,4vw,2.75rem)] leading-[1.02] text-ink">Assessments</h1>
        <p className="m-0 mt-2 text-[0.98rem] text-ink-2">{summary}</p>
      </header>

      {/* Overview */}
      <ul className="lms-rise m-0 mt-5 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4 lg:gap-4" style={{ "--i": 1 } as React.CSSProperties}>
        <OverviewTile
          label="Coming up"
          value={String(stats.upcoming_count)}
          icon={CalendarClock}
          tone="blue"
          active={currentTab === "upcoming"}
          onClick={() => changeTab("upcoming")}
        />
        <OverviewTile
          label="Completed"
          value={String(stats.completed_count)}
          icon={CheckCircle2}
          tone="green"
          active={currentTab === "completed"}
          onClick={() => changeTab("completed")}
        />
        <OverviewTile
          label="Average score"
          value={average === null ? "–" : `${average}%`}
          ring={average}
          tone="gold"
          active={currentTab === "results"}
          onClick={() => changeTab("results")}
        />
        <OverviewTile
          label="Retakes available"
          value={String(stats.retakes_available_count)}
          icon={RotateCcw}
          tone="red"
          active={currentTab === "retakes"}
          onClick={() => changeTab("retakes")}
        />
      </ul>

      {/* Toolbar */}
      <div className="lms-course-bar sticky top-[var(--lms-top)] z-20 -mx-3 mt-5 px-3 py-3 sm:-mx-5 sm:px-5 lg:-mx-7 lg:px-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="lms-scroll-x -mx-1 overflow-x-auto px-1 pb-0.5">
            <div role="tablist" aria-label="Show assessments" className="lms-segmented">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={currentTab === tab.id}
                  onClick={() => changeTab(tab.id)}
                  className="lms-segment"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:flex-none">
            <div className="lms-search min-w-0 flex-1 lg:w-[min(300px,26vw)] lg:flex-none">
              <label htmlFor="assessment-search" className="sr-only">
                Search assessments
              </label>
              <Search aria-hidden="true" className="lms-search-glyph" strokeWidth={2.2} />
              <input
                id="assessment-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && query) setQuery("");
                }}
                autoComplete="off"
                placeholder="Search"
              />
              {query && (
                <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="lms-search-clear">
                  <X className="h-3 w-3" strokeWidth={3} />
                </button>
              )}
            </div>
            <TypeMenu
              value={assessmentType}
              onChange={(value) => updateParam({ assessment_type: value, page: "1" })}
            />
          </div>
        </div>

        {dateRange && (
          <div className="mt-3 flex">
            <span className="lms-filter-token">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              Due {dateRange.label}
              <button type="button" onClick={clearDateRange} aria-label="Clear date filter" className="lms-filter-token-x">
                <X className="h-3 w-3" strokeWidth={2.6} />
              </button>
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-label="Assessments" className="min-w-0">
          {error ? (
            <p role="alert" className="m-0 rounded-[18px] bg-clay-wash px-5 py-3.5 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--sw-clay)_35%,transparent)]">
              {error}
            </p>
          ) : visibleAssessments.length === 0 ? (
            <div className="lms-milk flex flex-col items-center px-6 py-14 text-center sm:py-20">
              <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-card text-accent shadow-[inset_0_0_0_1px_var(--sw-line)] dark:bg-white/[0.06]">
                {query ? <Search className="h-7 w-7" strokeWidth={1.8} /> : <ClipboardCheck className="h-7 w-7" strokeWidth={1.8} />}
              </span>
              <h2 className="m-0 mt-5 text-[1.2rem] font-bold tracking-[-0.02em] text-ink">
                {query ? "No matches" : EMPTY_COPY[currentTab].title}
              </h2>
              <p className="m-0 mt-2 max-w-md text-[0.95rem] leading-relaxed text-ink-2">
                {query ? "Nothing on this page matches your search." : EMPTY_COPY[currentTab].body}
              </p>
              {(query || assessmentType || dateRange) && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    if (assessmentType || dateRange) {
                      updateParam({ assessment_type: null, start_date: null, end_date: null, page: "1" });
                    }
                  }}
                  className="lms-btn lms-btn--quiet mt-6"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <AssessmentTable rows={visibleAssessments} />
              </div>
              <ul className="lms-group m-0 list-none p-0 md:hidden">
                {visibleAssessments.map((assessment) => (
                  <AssessmentRow key={assessment.item_id} assessment={assessment} />
                ))}
              </ul>
            </>
          )}

          {!error && totalItems > 0 && (
            <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="m-0 text-sm text-ink-3">
                {showingStart}–{showingEnd} of {totalItems}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {totalPages > 1 && (
                  <nav className="lms-pager" aria-label="Assessment pages">
                    <button type="button" onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 1} aria-label="Previous page" className="lms-page">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="lms-page" aria-current="page">
                      {currentPage}
                    </span>
                    <span className="px-1 text-sm text-ink-3">of {totalPages}</span>
                    <button type="button" onClick={() => changePage(currentPage + 1)} disabled={currentPage >= Math.max(totalPages, 1)} aria-label="Next page" className="lms-page">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                )}
                <label className="flex items-center gap-2 text-sm text-ink-3">
                  Show
                  <select
                    value={pageSize}
                    onChange={(event) => updateParam({ rows: event.target.value, page: "1" })}
                    className="lms-popup"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </label>
              </div>
            </div>
          )}
        </section>

        <aside aria-label="Calendar and highlights" className="grid min-w-0 gap-4 md:grid-cols-2 xl:sticky xl:top-[calc(var(--lms-top)+5rem)] xl:grid-cols-1">
          <AssessmentCalendar
            key={dateRange?.startDate ?? "none"}
            assessments={calendarItems}
            activeDateRange={dateRange}
            onClearDate={clearDateRange}
            onSelectDate={(date, preferredTab) => {
              const nextRange = getDayRangeParams(date);
              updateParam({
                tab: preferredTab,
                start_date: nextRange.startDate,
                end_date: nextRange.endDate,
                page: "1",
              });
            }}
          />
          <div className="grid gap-4">
            <SideList
              title="Up next"
              href="/dashboard/assessments?tab=upcoming"
              items={upcomingAssessments.slice(0, 3)}
              empty="Nothing due. You’re all caught up."
            />
            <FeedbackList assessments={completedAssessments.slice(0, 3)} />
          </div>
        </aside>
      </div>
    </div>
  );
}

const EMPTY_COPY: Record<AssessmentTab, { title: string; body: string }> = {
  upcoming: { title: "Nothing coming up", body: "When a course opens a quiz or essay for you, it will appear here with its due date." },
  completed: { title: "No completed assessments", body: "Quizzes and essays you finish will be kept here, with their scores." },
  submitted: { title: "Nothing waiting for review", body: "Essays you submit stay here until your instructor releases a result." },
  results: { title: "No results yet", body: "Scores appear here as soon as they are published." },
  retakes: { title: "No retakes needed", body: "If a quiz needs another try and attempts remain, it will be listed here." },
};

type Tone = "green" | "gold" | "red" | "blue" | "gray" | "orange" | "indigo";

function OverviewTile({
  label,
  value,
  icon: Icon,
  ring,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  ring?: number | null;
  tone: Tone;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="lms-milk lms-milk-hover lms-tile flex h-full w-full cursor-pointer flex-col gap-3 p-4 text-left sm:p-5"
      >
        <span className="flex items-center justify-between gap-2">
          {ring !== undefined ? (
            <ScoreRing value={ring ?? 0} empty={ring === null} />
          ) : (
            Icon && (
              <span className={`lms-sym lms-sym--${tone}`}>
                <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
              </span>
            )
          )}
          <ChevronRight className="h-4 w-4 text-ink-3" aria-hidden="true" />
        </span>
        <span>
          <span className="lms-num block text-[1.9rem] text-ink sm:text-[2.2rem]">{value}</span>
          <span className="mt-1 block truncate text-[0.85rem] text-ink-2">{label}</span>
        </span>
      </button>
    </li>
  );
}

function ScoreRing({ value, empty, size = 36 }: { value: number; empty?: boolean; size?: number }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="lms-ring flex-none" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="text-ink" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={empty ? circumference : offset}
        style={{ "--ring": value >= 50 ? "var(--sw-accent)" : "var(--sw-clay)" } as React.CSSProperties}
      />
    </svg>
  );
}

function TypeMenu({
  value,
  onChange,
}: {
  value: "QUIZ" | "ESSAY" | "QUIZ_GROUP" | null;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const options: { value: string | null; label: string }[] = [
    { value: null, label: "All types" },
    { value: "QUIZ", label: "Quizzes" },
    { value: "ESSAY", label: "Essays" },
    { value: "QUIZ_GROUP", label: "Quiz groups" },
  ];
  const current = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPress, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPress, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`lms-pulldown ${value ? "lms-pulldown--on" : ""}`}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{value ? current.label : "Type"}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" aria-label="Assessment type" className="lms-menu lms-menu--down">
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              role="menuitemradio"
              aria-checked={option.value === value}
              onClick={() => {
                setOpen(false);
                onChange(option.value);
              }}
              className="lms-menu-item"
            >
              <Check className={`h-4 w-4 ${option.value === value ? "" : "invisible"}`} strokeWidth={2.4} aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AssessmentRow({ assessment }: { assessment: UserAssessment }) {
  const href = `/learn/${assessment.course_id}/item/${assessment.item_id}`;
  const status = getStatusDisplay(assessment);
  const action = getActionConfig(assessment);
  const failed = assessment.status?.toUpperCase() === "FAILED";
  const hasScore = typeof assessment.score === "number";

  return (
    <li>
      <Link href={href} className="lms-row group">
        <AssessmentIcon assessment={assessment} />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.95rem] font-semibold tracking-[-0.01em] text-ink">{assessment.title}</span>
          <span className="mt-0.5 block truncate text-[0.8rem] text-ink-3">
            {assessment.course_title} · {getAssessmentMetaLabel(assessment)}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.8rem]">
            <span className={`lms-status lms-status--${status.tone}`}>{status.label}</span>
            <span className="text-ink-3 md:hidden">
              {assessment.due_date ? `Due ${formatShortDate(assessment.due_date)}` : null}
              {hasScore ? ` · ${Math.round(assessment.score as number)}%` : null}
            </span>
            {getAttemptsLine(assessment) && (
              <span className="hidden text-ink-3 sm:inline">{getAttemptsLine(assessment)}</span>
            )}
          </span>
        </span>

        <span className="hidden">
          <span className="block text-[0.72rem] text-ink-3">{assessment.due_date ? "Due" : "Last activity"}</span>
          <span className="block text-[0.85rem] font-medium tabular-nums text-ink-2">
            {assessment.due_date
              ? formatDueDate(assessment.due_date)
              : assessment.last_activity_at
                ? formatShortDate(assessment.last_activity_at)
                : "Not started"}
          </span>
        </span>

        <span className="hidden">
          <span className="block text-[0.72rem] text-ink-3">Score</span>
          <span className={`block text-[1rem] font-semibold tabular-nums ${failed ? "text-[#d92d20] dark:text-[#ff6961]" : "text-ink"}`}>
            {hasScore ? `${Math.round(assessment.score as number)}%` : "–"}
          </span>
        </span>

        <span className={`lms-row-action lms-row-action--${action.tone} hidden sm:inline-flex`}>{action.label}</span>
        <ChevronRight className="h-4 w-4 flex-none text-ink-3 sm:hidden" aria-hidden="true" />
      </Link>
    </li>
  );
}

function AssessmentIcon({ assessment, small = false }: { assessment: UserAssessment; small?: boolean }) {
  const status = assessment.status?.toUpperCase();
  const type = assessment.assessment_type?.toUpperCase();
  let tone: Tone = type === "ESSAY" ? "orange" : type === "QUIZ_GROUP" ? "indigo" : "blue";
  let Icon: LucideIcon = type === "ESSAY" ? FilePenLine : type === "QUIZ_GROUP" ? Layers : ListChecks;

  if (status === "PASSED" || status === "GRADED") {
    tone = "green";
    Icon = Check;
  } else if (status === "FAILED") {
    tone = "red";
    Icon = RotateCcw;
  } else if (status === "SUBMITTED") {
    tone = "gold";
    Icon = Hourglass;
  }

  return (
    <span className={`lms-sym lms-sym--${tone} ${small ? "lms-sym--sm" : ""}`}>
      <Icon className={small ? "h-4 w-4" : "h-[18px] w-[18px]"} strokeWidth={2.4} aria-hidden="true" />
    </span>
  );
}

type SortKey = "title" | "due" | "status" | "score";

/** A macOS-style table: sortable column headers, alternating rows, the row opens the assessment. */
function AssessmentTable({ rows }: { rows: UserAssessment[] }) {
  const router = useRouter();
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const value = (item: UserAssessment): string | number => {
      switch (sort.key) {
        case "title":
          return item.title.toLowerCase();
        case "due":
          return item.due_date ? new Date(item.due_date).getTime() : Number.POSITIVE_INFINITY;
        case "status":
          return getStatusDisplay(item).label;
        case "score":
          return typeof item.score === "number" ? item.score : -1;
      }
    };
    return [...rows].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      const order = x < y ? -1 : x > y ? 1 : 0;
      return sort.dir === "asc" ? order : -order;
    });
  }, [rows, sort]);

  function header(key: SortKey, label: string, align: "left" | "right" = "left", className = "") {
    const active = sort?.key === key;
    return (
      <th
        scope="col"
        aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
        className={`${align === "right" ? "text-right" : ""} ${className}`}
      >
        <button
          type="button"
          onClick={() =>
            setSort((current) =>
              current?.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "score" ? "desc" : "asc" },
            )
          }
          className={`lms-th-btn ${align === "right" ? "justify-end" : ""}`}
          data-active={active || undefined}
        >
          {label}
          <ChevronDown
            aria-hidden="true"
            className={`h-3 w-3 transition-transform ${active ? "opacity-100" : "opacity-0"} ${active && sort.dir === "asc" ? "rotate-180" : ""}`}
            strokeWidth={2.6}
          />
        </button>
      </th>
    );
  }

  return (
    <div className="lms-table-wrap">
      <table className="lms-table">
        <thead>
          <tr>
            {header("title", "Name", "left", "w-[44%]")}
            {header("due", "Due", "left", "hidden lg:table-cell")}
            {header("status", "Status")}
            {header("score", "Score", "right")}
            <th scope="col" className="hidden text-right xl:table-cell">
              <span className="lms-th-btn justify-end">Attempts</span>
            </th>
            <th scope="col">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((assessment) => {
            const href = `/learn/${assessment.course_id}/item/${assessment.item_id}`;
            const status = getStatusDisplay(assessment);
            const action = getActionConfig(assessment);
            const failed = assessment.status?.toUpperCase() === "FAILED";
            const attempts = getAttemptsLine(assessment);
            return (
              <tr key={assessment.item_id} onClick={() => router.push(href)}>
                <td>
                  <div className="flex min-w-0 items-center gap-3">
                    <AssessmentIcon assessment={assessment} small />
                    <div className="min-w-0">
                      <Link
                        href={href}
                        onClick={(event) => event.stopPropagation()}
                        className="block truncate font-semibold text-ink no-underline"
                      >
                        {assessment.title}
                      </Link>
                      <span className="block truncate text-[0.78rem] text-ink-3">
                        {assessment.course_title} · {getAssessmentMetaLabel(assessment)}
                      </span>
                      <span className="block truncate text-[0.78rem] text-ink-3 lg:hidden">
                        {assessment.due_date ? `Due ${formatShortDate(assessment.due_date)}` : "No due date"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="hidden whitespace-nowrap tabular-nums text-ink-2 lg:table-cell">
                  {assessment.due_date ? (
                    <>
                      <span className="block">{formatShortDate(assessment.due_date)}</span>
                      <span className="block text-[0.75rem] text-ink-3">{formatTime(assessment.due_date)}</span>
                    </>
                  ) : (
                    <span className="text-ink-3">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap">
                  <span className={`lms-status lms-status--${status.tone}`}>{status.label}</span>
                </td>
                <td className={`whitespace-nowrap text-right font-semibold tabular-nums ${failed ? "text-[#d92d20] dark:text-[#ff6961]" : "text-ink"}`}>
                  {typeof assessment.score === "number" ? `${Math.round(assessment.score)}%` : <span className="font-normal text-ink-3">—</span>}
                </td>
                <td className="hidden whitespace-nowrap text-right tabular-nums text-ink-3 xl:table-cell">{attempts ?? "—"}</td>
                <td className="w-px whitespace-nowrap text-right">
                  <span className={`lms-row-action lms-row-action--${action.tone} inline-flex`}>{action.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatTime(value: string) {
  return `${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" }).format(new Date(value))} WAT`;
}

/** After Apple Calendar: month grid with today in red, the chosen day in ink, and that day's items below. */
function AssessmentCalendar({
  assessments,
  activeDateRange,
  onSelectDate,
  onClearDate,
}: {
  assessments: UserAssessment[];
  activeDateRange: AssessmentDateRange | null;
  onSelectDate: (date: Date, preferredTab: AssessmentTab) => void;
  onClearDate: () => void;
}) {
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState<Date>(() => (activeDateRange ? new Date(activeDateRange.startDate) : today));
  const [month, setMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const days = getCalendarDays(month);
  const todayKey = toDateKey(today);
  const selectedKey = toDateKey(selected);
  const filteredKey = activeDateRange ? toDateKey(activeDateRange.startDate) : null;

  const byDay = useMemo(() => {
    const map = new Map<string, UserAssessment[]>();
    for (const item of assessments) {
      const status = item.status?.toUpperCase();
      const when = item.due_date || (status !== "NOT_STARTED" ? item.last_activity_at : null);
      if (!when) continue;
      const key = toDateKey(when);
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return map;
  }, [assessments]);

  const dayTone = (item: UserAssessment): "soon" | "due" | "done" => {
    const status = item.status?.toUpperCase();
    if (["PASSED", "FAILED", "GRADED", "SUBMITTED"].includes(status)) return "done";
    const when = item.due_date ? new Date(item.due_date).getTime() : Number.POSITIVE_INFINITY;
    return when - today.getTime() <= 2 * 86_400_000 ? "soon" : "due";
  };

  const agenda = byDay.get(selectedKey) ?? [];
  const agendaTitle =
    selectedKey === todayKey
      ? "Today"
      : new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(selected);

  function pick(date: Date) {
    setSelected(date);
    if (date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) {
      setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }

  function goToday() {
    setSelected(today);
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  // Arrow keys move the selection by a day or a week, as in Calendar.
  function onGridKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 } as Record<string, number>)[event.key];
    if (!step) return;
    event.preventDefault();
    const grid = event.currentTarget;
    const next = new Date(selected);
    next.setDate(next.getDate() + step);
    pick(next);
    requestAnimationFrame(() => grid.querySelector<HTMLElement>(`[data-key="${toDateKey(next)}"]`)?.focus());
  }

  return (
    <section aria-label="Calendar" className="lms-card !rounded-[24px] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="m-0 text-[1.15rem] font-bold tracking-[-0.02em] text-ink" aria-live="polite">
          {new Intl.DateTimeFormat("en-GB", { month: "long" }).format(month)}{" "}
          <span className="font-normal text-ink-3">{month.getFullYear()}</span>
        </h2>
        <div className="lms-cal-nav">
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" strokeWidth={2.4} />
          </button>
          <button type="button" onClick={goToday} className="lms-cal-today">
            Today
          </button>
          <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <div role="grid" aria-label="Choose a day" onKeyDown={onGridKey} className="grid grid-cols-7 text-center">
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <span key={index} role="columnheader" className={`pb-1 text-[0.7rem] font-semibold ${index > 4 ? "text-ink-3/70" : "text-ink-3"}`}>
            {day}
          </span>
        ))}
        {days.map((day) => {
          const key = toDateKey(day.date);
          const items = byDay.get(key) ?? [];
          const tones = Array.from(new Set(items.map(dayTone))).slice(0, 3);
          const isSelected = key === selectedKey;
          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              data-key={key}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => pick(day.date)}
              aria-selected={isSelected}
              aria-label={`${new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(day.date)}${
                items.length ? `, ${items.length} assessment${items.length === 1 ? "" : "s"}` : ""
              }`}
              data-today={key === todayKey || undefined}
              data-out={!day.inCurrentMonth || undefined}
              className="lms-cal-day"
            >
              <span className="lms-cal-num">{day.date.getDate()}</span>
              <span aria-hidden="true" className="flex h-1.5 items-center gap-[3px]">
                {tones.map((tone) => (
                  <span key={tone} className={`lms-cal-dot lms-cal-dot--${tone}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* The chosen day's items, as Calendar lists events under the month */}
      <div className="mt-3 border-t border-line pt-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="m-0 text-[0.82rem] font-semibold text-ink">{agendaTitle}</p>
          {filteredKey === selectedKey ? (
            <button type="button" onClick={onClearDate} className="text-[0.8rem] font-semibold text-accent hover:underline">
              Show all
            </button>
          ) : agenda.length > 0 ? (
            <button
              type="button"
              onClick={() => onSelectDate(selected, agenda.some((item) => item.status?.toUpperCase() === "NOT_STARTED") ? "upcoming" : "completed")}
              className="text-[0.8rem] font-semibold text-accent hover:underline"
            >
              Show in list
            </button>
          ) : null}
        </div>
        {agenda.length === 0 ? (
          <p className="m-0 py-2 text-[0.82rem] text-ink-3">No assessments</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {agenda.map((item) => (
              <li key={item.item_id}>
                <Link href={`/learn/${item.course_id}/item/${item.item_id}`} className={`lms-event lms-event--${dayTone(item)}`}>
                  <span className="block truncate text-[0.85rem] font-semibold">{item.title}</span>
                  <span className="block truncate text-[0.75rem] opacity-80">
                    {item.due_date ? formatTime(item.due_date) : "Activity"} · {item.course_title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.72rem] text-ink-3">
        <Legend tone="soon" label="Due soon" />
        <Legend tone="due" label="Due" />
        <Legend tone="done" label="Done" />
      </div>
    </section>
  );
}

function SideList({
  title,
  href,
  items,
  empty,
}: {
  title: string;
  href: string;
  items: UserAssessment[];
  empty: string;
}) {
  return (
    <section aria-label={title} className="lms-card !rounded-[24px] p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-ink">{title}</h2>
        <Link href={href} className="inline-flex min-h-9 items-center text-[0.85rem] font-medium text-accent no-underline hover:underline">
          See all
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="m-0 rounded-[14px] bg-[var(--lms-milk)] p-3.5 text-sm text-ink-2">{empty}</p>
      ) : (
        <ul className="-mx-2 m-0 list-none p-0">
          {items.map((item) => (
            <li key={item.item_id}>
              <Link href={`/learn/${item.course_id}/item/${item.item_id}`} className="flex items-center gap-3 rounded-[14px] p-2 text-inherit no-underline transition-colors hover:bg-[var(--lms-milk)]">
                <AssessmentIcon assessment={item} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.9rem] font-semibold text-ink">{item.title}</span>
                  <span className="block truncate text-[0.78rem] text-ink-3">
                    {item.due_date ? `Due ${formatShortDate(item.due_date)}` : item.course_title}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 flex-none text-ink-3" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FeedbackList({ assessments }: { assessments: UserAssessment[] }) {
  return (
    <section aria-label="Recent results" className="lms-card !rounded-[24px] p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="m-0 text-[1.05rem] font-bold tracking-[-0.015em] text-ink">Recent results</h2>
        <Link href="/dashboard/assessments?tab=results" className="inline-flex min-h-9 items-center text-[0.85rem] font-medium text-accent no-underline hover:underline">
          See all
        </Link>
      </div>
      {assessments.length === 0 ? (
        <p className="m-0 rounded-[14px] bg-[var(--lms-milk)] p-3.5 text-sm text-ink-2">Published scores will appear here.</p>
      ) : (
        <ul className="-mx-2 m-0 list-none p-0">
          {assessments.map((assessment) => {
            const hasScore = typeof assessment.score === "number";
            return (
              <li key={assessment.item_id}>
                <Link
                  href={`/learn/${assessment.course_id}/item/${assessment.item_id}`}
                  className="flex items-center gap-3 rounded-[14px] p-2 text-inherit no-underline transition-colors hover:bg-[var(--lms-milk)]"
                >
                  {hasScore ? (
                    <span className="relative grid flex-none place-items-center">
                      <ScoreRing value={Math.round(assessment.score as number)} size={40} />
                      <span className="absolute text-[0.62rem] font-bold tabular-nums text-ink">
                        {Math.round(assessment.score as number)}
                      </span>
                    </span>
                  ) : (
                    <AssessmentIcon assessment={assessment} />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9rem] font-semibold text-ink">{assessment.title}</span>
                    <span className="block truncate text-[0.78rem] text-ink-3">{getFeedbackPreview(assessment)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Legend({ tone, label }: { tone: "due" | "soon" | "done"; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={`lms-cal-dot lms-cal-dot--${tone}`} />
      {label}
    </span>
  );
}

function getAttemptsLine(assessment: UserAssessment) {
  const type = assessment.assessment_type?.toUpperCase();
  if (type !== "QUIZ" && type !== "QUIZ_GROUP") return null;
  if (typeof assessment.max_attempts !== "number") return null;
  const used = typeof assessment.attempts_used === "number" ? assessment.attempts_used : 0;
  return `${used} of ${assessment.max_attempts} attempts`;
}

function getStatusDisplay(assessment: UserAssessment): { label: string; tone: Tone } {
  const status = assessment.status?.toUpperCase();
  if (isEssayAwaitingResult(assessment)) return { label: "Awaiting result", tone: "orange" };
  switch (status) {
    case "NOT_STARTED":
      return { label: "Not started", tone: "blue" };
    case "SUBMITTED":
      return { label: "Submitted", tone: "orange" };
    case "PASSED":
      return { label: "Passed", tone: "green" };
    case "GRADED":
      return { label: "Graded", tone: "green" };
    case "FAILED":
      return { label: "Retake needed", tone: "red" };
    default:
      return { label: status ? toTitleCase(status) : "Unknown", tone: "gray" };
  }
}

function getActionConfig(assessment: UserAssessment): { label: string; tone: "primary" | "plain" | "red" } {
  const status = assessment.status?.toUpperCase();
  if (status === "NOT_STARTED") return { label: "Start", tone: "primary" };
  if (status === "FAILED") {
    return assessment.attempts_remaining === 0 ? { label: "Review", tone: "plain" } : { label: "Retake", tone: "red" };
  }
  if (status === "PASSED" || status === "GRADED") return { label: "View result", tone: "plain" };
  if (status === "SUBMITTED") return { label: isEssayAwaitingResult(assessment) ? "View status" : "Continue", tone: "plain" };
  return { label: "Open", tone: "plain" };
}

function getAssessmentMetaLabel(assessment: UserAssessment) {
  const type = assessment.assessment_type?.toUpperCase();
  const typeLabel =
    type === "ESSAY"
      ? "Essay"
      : type === "QUIZ"
        ? "Quiz"
        : type === "QUIZ_GROUP"
          ? "Quiz Group"
          : "Assessment";
  const estimate = getEstimatedMinutes(assessment);

  return estimate > 0 ? `${typeLabel} · ${formatMinutes(estimate)}` : typeLabel;
}

function getEstimatedMinutes(item: { estimated_minutes?: number | null }) {
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

function getFeedbackPreview(assessment: UserAssessment) {
  const status = assessment.status?.toUpperCase();
  if (status === "FAILED") {
    return "Try again while attempts remain";
  }
  if (status === "PASSED" || status === "GRADED") {
    return "Result available";
  }
  if (isEssayAwaitingResult(assessment)) {
    return "Being marked. You’ll be notified when the result is out.";
  }
  return "Awaiting review";
}

function isEssayAwaitingResult(assessment: UserAssessment) {
  return (
    assessment.assessment_type?.toUpperCase() === "ESSAY" &&
    assessment.status?.toUpperCase() === "SUBMITTED" &&
    assessment.is_graded !== true &&
    assessment.is_published !== true
  );
}

function formatDueDate(value: string) {
  const date = new Date(value);
  const datePart = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  }).format(date);

  return `${datePart} ${timePart} WAT`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function getCalendarDays(monthDate: Date) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDay = (start.getDay() + 6) % 7;
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - startDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      inCurrentMonth: date.getMonth() === monthDate.getMonth(),
    };
  });
}

function toDateKey(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDayRangeParams(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

function mergeByItemId(items: UserAssessment[]) {
  const map = new Map<string, UserAssessment>();
  items.forEach((item) => map.set(item.item_id, item));
  return Array.from(map.values());
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
