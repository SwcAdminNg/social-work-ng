"use client";

import "./search.css";
import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Clock3,
  CornerDownLeft,
  FileText,
  GraduationCap,
  LibraryBig,
  Radio,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import type { SearchHit, SearchResponse } from "@/app/api/proxy/search/route";
import { STATIC_ENTRIES, SUGGESTED_IDS, scoreText, searchStatic, type StaticEntry } from "./searchIndex";

/* ────────────────────────────────────────────────────────────────────────
   Search palette: a console-style "search everything" dialog. Pages and
   actions are matched on the device as you type; courses, your learning,
   resources, community rooms and live sessions come from /api/proxy/search.
   ──────────────────────────────────────────────────────────────────────── */

type Scope = "all" | "pages" | "my-courses" | "courses" | "live" | "resources" | "community";

type Row = {
  key: string;
  title: string;
  subtitle?: string;
  meta?: string;
  href?: string;
  action?: StaticEntry["action"];
  icon: LucideIcon;
  thumbnail?: string | null;
  tone: "page" | "course" | "learn" | "resource" | "community" | "live" | "recent" | "search";
  /** What gets remembered in "Recent" when this row is opened. */
  recent?: RecentItem;
};

type Section = { key: string; label: string; rows: Row[]; score: number };

type RecentItem = {
  key: string;
  title: string;
  subtitle?: string;
  href: string;
  kind: SearchHit["kind"] | "page";
  thumbnail?: string | null;
};

const SCOPES: { key: Scope; label: string; source?: keyof Omit<SearchResponse, "query"> }[] = [
  { key: "all", label: "All" },
  { key: "pages", label: "Pages" },
  { key: "my-courses", label: "My learning", source: "my_courses" },
  { key: "courses", label: "Courses", source: "courses" },
  { key: "live", label: "Live sessions", source: "live_sessions" },
  { key: "resources", label: "Resources", source: "resources" },
  { key: "community", label: "Community", source: "communities" },
];

const KIND_LOOK: Record<SearchHit["kind"] | "page", { icon: LucideIcon; tone: Row["tone"] }> = {
  course: { icon: LibraryBig, tone: "course" },
  "my-course": { icon: GraduationCap, tone: "learn" },
  resource: { icon: FileText, tone: "resource" },
  community: { icon: UsersRound, tone: "community" },
  "live-session": { icon: Radio, tone: "live" },
  page: { icon: BookOpen, tone: "page" },
};

/* Layout facts the markup (not just the CSS) needs to follow. */
const COMPACT_QUERY = "(max-width: 479.98px)";
const KEYBOARD_QUERY = "(min-width: 640px) and (pointer: fine)";
const watch = (query: string) => (onChange: () => void) => {
  const list = window.matchMedia(query);
  list.addEventListener("change", onChange);
  return () => list.removeEventListener("change", onChange);
};
const subscribeCompact = watch(COMPACT_QUERY);
const subscribeKeyboard = watch(KEYBOARD_QUERY);
const isCompact = () => window.matchMedia(COMPACT_QUERY).matches;
const isKeyboardLayout = () => window.matchMedia(KEYBOARD_QUERY).matches;

/** Marks which edges of the tab strip hide more tabs, so they can fade. */
function updateFade(strip: HTMLElement | null) {
  if (!strip) return;
  const max = strip.scrollWidth - strip.clientWidth;
  const edges = [strip.scrollLeft > 2 && "start", strip.scrollLeft < max - 2 && "end"].filter(Boolean).join(" ");
  if (edges) strip.dataset.fade = edges;
  else delete strip.dataset.fade;
}

const RECENT_KEY = "swcl_search_recent";
const RECENT_MAX = 6;

function readRecent(): RecentItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.href && item.title).slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function writeRecent(items: RecentItem[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, RECENT_MAX)));
  } catch {
    /* private mode: recents simply are not kept */
  }
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Bolds the parts of `text` that match a word of the query. */
function Highlight({ text, query }: { text: string; query: string }) {
  const words = query.trim().split(/\s+/).filter((word) => word.length > 0).map(escapeRegExp);
  if (!words.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${words.join("|")})`, "ig"));
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark key={index} className="lms-cmdk-mark">
            {part}
          </mark>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function hitToRow(hit: SearchHit): Row {
  const look = KIND_LOOK[hit.kind];
  return {
    key: `${hit.kind}:${hit.id}`,
    title: hit.title,
    subtitle: hit.subtitle,
    meta: hit.meta,
    href: hit.href,
    icon: look.icon,
    tone: look.tone,
    thumbnail: hit.thumbnail,
    recent: { key: `${hit.kind}:${hit.id}`, title: hit.title, subtitle: hit.subtitle, href: hit.href, kind: hit.kind, thumbnail: hit.thumbnail },
  };
}

function entryToRow(entry: StaticEntry): Row {
  return {
    key: entry.id,
    title: entry.title,
    subtitle: entry.section,
    href: entry.href,
    action: entry.action,
    icon: entry.icon,
    tone: "page",
    meta: entry.action ? "Action" : undefined,
    recent: entry.href
      ? { key: entry.id, title: entry.title, subtitle: entry.section, href: entry.href, kind: "page" }
      : undefined,
  };
}

function recentToRow(item: RecentItem): Row {
  const entry = item.kind === "page" ? STATIC_ENTRIES.find((candidate) => candidate.id === item.key) : undefined;
  const look = KIND_LOOK[item.kind] ?? KIND_LOOK.page;
  return {
    key: `recent:${item.key}`,
    title: item.title,
    subtitle: item.subtitle,
    href: item.href,
    icon: entry?.icon ?? look.icon,
    tone: look.tone,
    thumbnail: item.thumbnail,
    recent: item,
  };
}

export function SearchPalette({
  open,
  onClose,
  onToggleTheme,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
  onSignOut: () => void;
}) {
  const router = useRouter();
  const baseId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const scopesRef = useRef<HTMLDivElement>(null);
  const compact = useSyncExternalStore(subscribeCompact, isCompact, () => false);
  const keyboardLayout = useSyncExternalStore(subscribeKeyboard, isKeyboardLayout, () => true);
  const cache = useRef(new Map<string, SearchResponse>());
  const restoreFocus = useRef<HTMLElement | null>(null);

  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [wasOpen, setWasOpen] = useState(false);

  // Each opening starts fresh, on "All", with the latest recents.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setScope("all");
      setActive(0);
      setFailed(false);
      setRecent(readRecent());
    }
  }

  const trimmed = query.trim();

  // Ask the server, debounced, cancelling anything still in flight.
  useEffect(() => {
    if (!open) return;
    const key = trimmed.toLowerCase();
    const cached = cache.current.get(key);
    if (cached) {
      setResults(cached);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/proxy/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as SearchResponse;
        cache.current.set(key, data);
        if (cache.current.size > 40) cache.current.delete(cache.current.keys().next().value as string);
        setResults(data);
        setFailed(false);
        setLoading(false);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setFailed(true);
        setLoading(false);
      }
    }, key ? 170 : 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, trimmed]);

  // Keep focus inside while open, lock the page behind, give focus back after.
  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      root.style.overflow = previous;
      restoreFocus.current?.focus?.();
    };
  }, [open]);

  // Results only count when they answer what is typed now.
  const fresh = results && results.query.toLowerCase() === trimmed.toLowerCase() ? results : null;

  const sections = useMemo<Section[]>(() => {
    const list: Section[] = [];

    if (!trimmed) {
      const learning = results?.query === "" ? results.my_courses : [];
      if (scope === "my-courses" && learning.length) {
        list.push({ key: "continue", label: "Continue learning", rows: learning.map(hitToRow), score: 2 });
      }
      if (scope === "all" || scope === "pages") {
        if (recent.length && scope === "all") list.push({ key: "recent", label: "Recent", rows: recent.map(recentToRow), score: 3 });
        if (learning.length && scope === "all") list.push({ key: "continue", label: "Continue learning", rows: learning.map(hitToRow), score: 2 });
        const pages = scope === "pages" ? STATIC_ENTRIES : STATIC_ENTRIES.filter((entry) => SUGGESTED_IDS.includes(entry.id));
        list.push({ key: "pages", label: scope === "pages" ? "All pages" : "Jump to", rows: pages.map(entryToRow), score: 1 });
      }
      return list;
    }

    const limit = scope === "all" ? 4 : 12;
    if (scope === "all" || scope === "pages") {
      const entries = searchStatic(trimmed, scope === "pages" ? 12 : 4);
      if (entries.length) {
        list.push({
          key: "pages",
          label: "Pages & actions",
          rows: entries.map(entryToRow),
          score: scoreText(trimmed, entries[0].title, entries[0].keywords),
        });
      }
    }

    if (fresh) {
      for (const { key, label, source } of SCOPES) {
        if (!source || (scope !== "all" && scope !== key)) continue;
        const hits = fresh[source];
        if (!hits.length) continue;
        const best = Math.max(...hits.map((hit) => scoreText(trimmed, hit.title, [hit.subtitle ?? ""])));
        // The server already judged these relevant; anything it returns ranks.
        list.push({ key, label, rows: hits.slice(0, limit).map(hitToRow), score: best || 10 });
      }
    }

    // The strongest kind of answer leads; ties keep the order above.
    const order = new Map(list.map((section, index) => [section.key, index]));
    list.sort((a, b) => b.score - a.score || (order.get(a.key)! - order.get(b.key)!));

    // Always offer the full-page searches last.
    if (scope === "all" || scope === "courses" || scope === "resources") {
      const rows: Row[] = [];
      if (scope !== "resources")
        rows.push({
          key: "search:catalogue",
          title: `Search the catalogue for “${trimmed}”`,
          subtitle: "Course Catalogue",
          href: `/dashboard/course-catalogue?search=${encodeURIComponent(trimmed)}`,
          icon: Search,
          tone: "search",
        });
      if (scope !== "courses")
        rows.push({
          key: "search:resources",
          title: `Search resources for “${trimmed}”`,
          subtitle: "Resources",
          href: `/dashboard/resources?search=${encodeURIComponent(trimmed)}`,
          icon: Search,
          tone: "search",
        });
      list.push({ key: "more", label: "Search everywhere", rows, score: -1 });
    }
    return list;
  }, [trimmed, scope, fresh, results, recent]);

  const rows = useMemo(() => sections.flatMap((section) => section.rows), [sections]);
  const activeIndex = Math.min(active, Math.max(rows.length - 1, 0));
  const activeRow = rows[activeIndex];
  const optionId = (row: Row) => `${baseId}-opt-${row.key.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  const counts = useMemo(() => {
    const map: Partial<Record<Scope, number>> = {};
    if (!trimmed) return map;
    map.pages = searchStatic(trimmed, 12).length;
    if (fresh) for (const { key, source } of SCOPES) if (source) map[key] = fresh[source].length;
    return map;
  }, [trimmed, fresh]);

  // The selected tab stays visible in the strip (Tab can walk past the edge),
  // and the edge fades follow resizes and the counts appearing.
  useEffect(() => {
    if (!open) return;
    const strip = scopesRef.current;
    if (!strip) return;
    const tab = strip.querySelector<HTMLElement>('[aria-selected="true"]');
    if (tab) {
      const left = tab.offsetLeft - strip.clientWidth / 2 + tab.offsetWidth / 2;
      strip.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
    updateFade(strip);
    const observer = new ResizeObserver(() => updateFade(strip));
    observer.observe(strip);
    return () => observer.disconnect();
  }, [open, scope, counts]);

  // Keep the highlighted row in view.
  useEffect(() => {
    if (!activeRow) return;
    document.getElementById(optionId(activeRow))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRow?.key]);

  const remember = useCallback((item?: RecentItem) => {
    if (!item) return;
    const next = [item, ...readRecent().filter((existing) => existing.key !== item.key && existing.href !== item.href)];
    writeRecent(next);
  }, []);

  const choose = useCallback(
    (row: Row | undefined, newTab = false) => {
      if (!row) return;
      if (row.action === "toggle-theme") {
        onToggleTheme();
        onClose();
        return;
      }
      if (row.action === "sign-out") {
        onClose();
        onSignOut();
        return;
      }
      if (!row.href) return;
      remember(row.recent);
      if (newTab) {
        window.open(row.href, "_blank", "noopener");
        return;
      }
      onClose();
      router.push(row.href);
    },
    [onClose, onSignOut, onToggleTheme, remember, router],
  );

  const forget = (key: string) => {
    const next = readRecent().filter((item) => `recent:${item.key}` !== key);
    writeRecent(next);
    setRecent(next);
  };

  function onKeyDown(event: React.KeyboardEvent) {
    const count = rows.length;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (count) setActive((activeIndex + 1) % count);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (count) setActive((activeIndex - 1 + count) % count);
        break;
      case "PageDown":
      case "PageUp": {
        event.preventDefault();
        // Jump a whole section at a time.
        let start = 0;
        const starts = sections.map((section) => {
          const at = start;
          start += section.rows.length;
          return at;
        });
        const current = starts.findLastIndex((at) => at <= activeIndex);
        const target = event.key === "PageDown" ? Math.min(current + 1, starts.length - 1) : Math.max(current - 1, 0);
        setActive(starts[target] ?? 0);
        break;
      }
      case "Home":
        if (event.target === inputRef.current && query) break;
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        if (event.target === inputRef.current && query) break;
        event.preventDefault();
        setActive(Math.max(count - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        choose(activeRow, event.metaKey || event.ctrlKey);
        break;
      case "Tab": {
        // Tab walks the scopes, like switching tabs in a cloud console search.
        event.preventDefault();
        const index = SCOPES.findIndex((item) => item.key === scope);
        const next = SCOPES[(index + (event.shiftKey ? -1 : 1) + SCOPES.length) % SCOPES.length];
        setScope(next.key);
        setActive(0);
        break;
      }
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        if (query) {
          setQuery("");
          setActive(0);
        } else onClose();
        break;
    }
  }

  if (!open || typeof document === "undefined") return null;

  const waiting = Boolean(trimmed) && !fresh && !failed;
  const nothing = Boolean(trimmed && fresh) && !sections.some((section) => section.key !== "more");
  const scopeLabel = SCOPES.find((item) => item.key === scope)?.label.toLowerCase();
  const idleScope = !trimmed && !sections.length;
  let rowIndex = -1;

  return createPortal(
    <div className="lms-cmdk-root" data-search-palette="" data-keep-popover="">
      <div className="lms-cmdk-scrim" aria-hidden="true" onMouseDown={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="lms-cmdk"
        onKeyDown={onKeyDown}
      >
        <div className="lms-cmdk-field">
          {loading ? (
            <span className="lms-cmdk-spinner" aria-hidden="true" />
          ) : (
            <Search aria-hidden="true" className="lms-cmdk-glyph" strokeWidth={2.2} />
          )}
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${baseId}-list`}
            aria-activedescendant={activeRow ? optionId(activeRow) : undefined}
            aria-autocomplete="list"
            aria-label="Search pages, courses, resources and community"
            placeholder={compact ? "Search everything…" : "Search pages, courses, resources, community…"}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          {query && (
            <button
              type="button"
              className="lms-cmdk-clear"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setActive(0);
                inputRef.current?.focus();
              }}
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.6} />
            </button>
          )}
          <button type="button" className="lms-cmdk-esc" onClick={onClose}>
            {keyboardLayout ? (
              <>
                <span aria-hidden="true">esc</span>
                <span className="sr-only">Close search</span>
              </>
            ) : (
              "Cancel"
            )}
          </button>
        </div>

        <div
          ref={scopesRef}
          role="tablist"
          aria-label="Search in"
          className="lms-cmdk-scopes"
          onScroll={(event) => updateFade(event.currentTarget)}
        >
          {SCOPES.map(({ key, label }) => {
            const selected = scope === key;
            const count = counts[key];
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                tabIndex={-1}
                onClick={() => {
                  setScope(key);
                  setActive(0);
                  inputRef.current?.focus();
                }}
                className="lms-cmdk-scope"
              >
                {label}
                {key !== "all" && count !== undefined && count > 0 && <span className="lms-cmdk-count">{count}</span>}
              </button>
            );
          })}
        </div>

        <div ref={listRef} id={`${baseId}-list`} role="listbox" aria-label="Results" className="lms-cmdk-list lms-scroll">
          {failed && (
            <p className="lms-cmdk-note" role="status">
              Live results could not load. Pages still work, or try again in a moment.
            </p>
          )}

          {sections.map((section) => (
            <div key={section.key} role="group" aria-labelledby={`${baseId}-g-${section.key}`} className="lms-cmdk-group">
              <p id={`${baseId}-g-${section.key}`} className="lms-cmdk-heading">
                {section.key === "recent" && <Clock3 className="h-3 w-3" aria-hidden="true" />}
                {section.label}
              </p>
              {section.rows.map((row) => {
                rowIndex += 1;
                const index = rowIndex;
                const selected = index === activeIndex;
                const Icon = row.icon;
                return (
                  <div
                    key={row.key}
                    id={optionId(row)}
                    role="option"
                    aria-selected={selected}
                    data-tone={row.tone}
                    className="lms-cmdk-row"
                    onMouseMove={() => {
                      if (!selected) setActive(index);
                    }}
                    onClick={(event) => choose(row, event.metaKey || event.ctrlKey)}
                    onAuxClick={(event) => {
                      if (event.button === 1) choose(row, true);
                    }}
                  >
                    <span className="lms-cmdk-tile" aria-hidden="true">
                      {row.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.thumbnail} alt="" loading="lazy" onError={(event) => (event.currentTarget.style.display = "none")} />
                      ) : null}
                      <Icon strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="lms-cmdk-title">
                        <Highlight text={row.title} query={row.tone === "search" ? "" : trimmed} />
                      </span>
                      {row.subtitle && <span className="lms-cmdk-sub">{row.subtitle}</span>}
                    </span>
                    {row.meta && <span className="lms-cmdk-meta">{row.meta}</span>}
                    {section.key === "recent" ? (
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={`Remove ${row.title} from recent`}
                        className="lms-cmdk-forget"
                        onClick={(event) => {
                          event.stopPropagation();
                          forget(row.key);
                        }}
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2.4} />
                      </button>
                    ) : (
                      <span className="lms-cmdk-go" aria-hidden="true">
                        {row.tone === "search" ? <ArrowRight className="h-4 w-4" /> : <CornerDownLeft className="h-3.5 w-3.5" />}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {waiting && (
            <div className="lms-cmdk-group" aria-hidden="true">
              <p className="lms-cmdk-heading">Searching courses, resources and rooms…</p>
              {[0, 1, 2].map((item) => (
                <div key={item} className="lms-cmdk-row lms-cmdk-skeleton">
                  <span className="lms-cmdk-tile" />
                  <span className="flex flex-1 flex-col gap-1.5">
                    <span className="lms-cmdk-bone w-1/2" />
                    <span className="lms-cmdk-bone w-1/3" />
                  </span>
                </div>
              ))}
            </div>
          )}

          {idleScope && (
            <div className="lms-cmdk-empty">
              <Search className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
              <p className="m-0">Start typing to search {scopeLabel}.</p>
            </div>
          )}

          {nothing && (
            <div className="lms-cmdk-empty" role="status">
              <Search className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
              <p className="m-0 font-semibold text-ink">No matches for “{trimmed}”</p>
              <p className="m-0">Check the spelling, try fewer words, or search the full catalogue below.</p>
            </div>
          )}
        </div>

        <div className="lms-cmdk-foot" aria-hidden="true">
          <span>
            <kbd><ArrowUp className="h-3 w-3" /></kbd>
            <kbd><ArrowDown className="h-3 w-3" /></kbd> move
          </span>
          <span>
            <kbd><CornerDownLeft className="h-3 w-3" /></kbd> open
          </span>
          <span>
            <kbd>tab</kbd> switch scope
          </span>
          <span className="max-md:hidden">
            <kbd>ctrl</kbd>+<kbd><CornerDownLeft className="h-3 w-3" /></kbd> new tab
          </span>
          <span className="ml-auto">
            <kbd>esc</kbd> close
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
