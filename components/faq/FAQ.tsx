"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Link2,
  MessageCircleQuestion,
  Search,
  X,
} from "lucide-react";
import PageHero from "@/components/site/PageHero";
import lib from "@/components/resources/library/Library.module.css";
import s from "./FAQ.module.css";

type FAQAudience = "STUDENT" | "INSTRUCTOR" | "BOTH";
type AudienceFilter = "ALL" | "STUDENT" | "INSTRUCTOR";

export interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  order: number;
  is_published?: boolean;
  audience?: FAQAudience;
  keywords?: string[];
  escalation_route?: string;
  related_article_ids?: string[];
}

export interface FAQCategory {
  id: string;
  name: string;
  order: number;
  items: FAQItem[];
}

const AUDIENCES: { value: AudienceFilter; label: string }[] = [
  { value: "ALL", label: "Everyone" },
  { value: "STUDENT", label: "Learners" },
  { value: "INSTRUCTOR", label: "Instructors" },
];

/** Category names carry an audience suffix in the admin, e.g. "Payments (Student)". */
const cleanName = (name: string) =>
  name.replace(/\s*\((Student|Instructor|Both)\)\s*$/i, "");

const matchesAudience = (item: FAQItem, audience: AudienceFilter) =>
  audience === "ALL" ||
  !item.audience ||
  item.audience === audience ||
  item.audience === "BOTH";

const topicAnchor = (id: string) => `topic-${id}`;

function highlight(text: string, query: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i}>{part}</mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

const subscribeHash = (callback: () => void) => {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
};

/** Marks the topic group currently being read, for the topic menus. */
function useActiveTopic(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const groupIds = key ? key.split("|") : [];
    if (groupIds.length === 0) return;
    let frame = 0;
    const pick = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current = groupIds[0];
      for (const id of groupIds) {
        const el = document.getElementById(topicAnchor(id));
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // At the foot of the page the last short groups can never reach the line.
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      ) {
        current = groupIds[groupIds.length - 1];
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };
    frame = requestAnimationFrame(pick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);

  return active;
}

export default function FAQ({
  categories,
  isAuthenticated,
  loadFailed,
}: {
  categories: FAQCategory[];
  isAuthenticated: boolean;
  loadFailed: boolean;
}) {
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState<AudienceFilter>("ALL");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [closedFromLink, setClosedFromLink] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const chipsRef = useRef<HTMLUListElement>(null);

  // A link such as /faq#faq-<id> opens that answer.
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "",
  );
  const linkedId =
    !closedFromLink && hash.startsWith("#faq-") ? hash.slice(5) : null;

  const sorted = useMemo(
    () =>
      [...categories]
        .sort((a, b) => a.order - b.order)
        .map((c) => ({
          ...c,
          label: cleanName(c.name),
          items: [...c.items].sort((a, b) => a.order - b.order),
        })),
    [categories],
  );
  const byId = useMemo(
    () => new Map(sorted.flatMap((c) => c.items.map((i) => [i.id, i]))),
    [sorted],
  );
  const total = sorted.reduce((n, c) => n + c.items.length, 0);
  const numbers = useMemo(
    () =>
      new Map(
        sorted.filter((c) => c.items.length > 0).map((c, i) => [c.id, i + 1]),
      ),
    [sorted],
  );

  const q = query.trim().toLowerCase();
  const groups = sorted
    .map((c) => ({
      ...c,
      items: c.items.filter(
        (i) =>
          matchesAudience(i, audience) &&
          (!q ||
            [i.question, i.answer, c.label, ...(i.keywords || [])]
              .join(" ")
              .toLowerCase()
              .includes(q)),
      ),
    }))
    .filter((c) => c.items.length > 0);
  const results = groups.flatMap((g) => g.items);
  const groupIds = groups.map((g) => g.id);
  const activeTopic = useActiveTopic(groupIds);
  const audienceIndex = AUDIENCES.findIndex((a) => a.value === audience);

  // On narrow screens the topic bar scrolls sideways; keep the current topic in view.
  useEffect(() => {
    const bar = chipsRef.current;
    const chip = bar?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!bar || !chip) return;
    const target = chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2;
    bar.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeTopic]);

  // "/" jumps to search from anywhere that is not already a text field.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const isOpen = (id: string) => openIds.has(id) || linkedId === id;
  const toggle = (id: string) => {
    if (linkedId === id) {
      setClosedFromLink(true);
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id) || linkedId === id) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const openRelated = (id: string) => {
    setAudience("ALL");
    setQuery("");
    setOpenIds((current) => new Set(current).add(id));
    requestAnimationFrame(() => {
      const el = document.getElementById(`faq-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      el?.querySelector<HTMLButtonElement>("button")?.focus({
        preventScroll: true,
      });
    });
  };
  const copyLink = async (id: string) => {
    const url = `${window.location.origin}/faq#faq-${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
    } catch {
      window.location.hash = `faq-${id}`;
    }
  };
  const allOpen = results.length > 0 && results.every((r) => isOpen(r.id));
  const clearFilters = () => {
    setQuery("");
    setAudience("ALL");
  };

  const ticketHref = (subject?: string) => {
    const params = new URLSearchParams({ new: "1" });
    if (subject) {
      params.set("subject", subject);
      params.set(
        "message",
        `I read the FAQ answer about "${subject}" but still need help.`,
      );
    }
    const path = `/dashboard/support-tickets?${params.toString()}`;
    return isAuthenticated
      ? path
      : `/login?callbackUrl=${encodeURIComponent(path)}`;
  };

  return (
    <>
      <PageHero
        id="faq-heading"
        eyebrow="Frequently asked questions"
        title="How can we *help?*"
        lead="Answers about courses, payments, certificates and your account, written by our support team. Search, or browse by topic."
        compact
      >
        {total > 0 && (
          <div className="w-full max-w-2xl">
            <form role="search" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="faq-search" className="sr-only">
                Search the FAQs
              </label>
              <div className="relative">
                <Search
                  size={20}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#10231a]/55 sm:left-6"
                />
                <input
                  ref={searchRef}
                  id="faq-search"
                  type="search"
                  className="h-14 w-full rounded-full border-0 bg-white pl-12 pr-14 text-base text-[#10231a] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)] outline-none ring-0 transition-shadow duration-300 placeholder:text-[#10231a]/50 focus-visible:ring-4 focus-visible:ring-gold/60 sm:h-16 sm:pl-14 sm:text-[1.05rem] [&::-webkit-search-cancel-button]:hidden"
                  placeholder="Search the FAQs"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                  enterKeyHint="search"
                />
                {query ? (
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-[#10231a]/[0.07] text-[#10231a] transition-colors hover:bg-[#10231a]/15 sm:right-3"
                    onClick={() => {
                      setQuery("");
                      searchRef.current?.focus();
                    }}
                    aria-label="Clear search"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                ) : (
                  <kbd
                    aria-hidden="true"
                    className="pointer-events-none absolute right-5 top-1/2 hidden h-7 min-w-7 -translate-y-1/2 place-items-center rounded-lg border border-[#10231a]/15 px-2 font-sans text-sm text-[#10231a]/55 md:grid"
                  >
                    /
                  </kbd>
                )}
              </div>
            </form>
            <p className="m-0 mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
              <span>
                <strong className="font-semibold text-white">{total}</strong>{" "}
                answers
              </span>
              <span
                aria-hidden="true"
                className="h-1 w-1 rounded-full bg-gold"
              />
              <span>
                <strong className="font-semibold text-white">
                  {numbers.size}
                </strong>{" "}
                topics
              </span>
            </p>
          </div>
        )}
      </PageHero>

      <div className={`${lib.page} ${s.page} sw-sheet`}>
        <div className={`${lib.container} ${s.body}`}>
          {total === 0 ? (
            <div className={lib.state} role={loadFailed ? "alert" : undefined}>
              <h2 style={{ fontSize: "1.3rem" }}>
                {loadFailed
                  ? "We could not load the FAQs right now."
                  : "Answers are being added."}
              </h2>
              <p>
                {loadFailed
                  ? "Please try again shortly, or send us your question."
                  : "In the meantime, send us your question and we will reply by email."}
              </p>
              <div className={lib.stateActions}>
                <Link
                  href="/contact"
                  className={`${lib.cta} ${lib.ctaPrimary}`}
                >
                  Send us a message <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className={s.layout}>
                {groups.length > 1 && (
                  <nav aria-label="Topics" className={s.index}>
                    <p className={s.indexLabel}>Topics</p>
                    <ul className={s.indexList}>
                      {groups.map((g) => (
                        <li key={g.id}>
                          <a
                            href={`#${topicAnchor(g.id)}`}
                            className={s.indexLink}
                            aria-current={
                              activeTopic === g.id ? "true" : undefined
                            }
                          >
                            <span className={s.indexName}>{g.label}</span>
                            <span className={s.indexCount}>
                              {g.items.length}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact" className={s.indexHelp}>
                      <MessageCircleQuestion size={18} aria-hidden="true" />
                      <span>
                        <strong>Can’t find it?</strong>
                        Ask our support team
                      </span>
                    </Link>
                  </nav>
                )}

                <div className={s.main}>
                  <div className={s.toolbar}>
                    <div
                      className={s.segmented}
                      role="group"
                      aria-label="Show answers for"
                      style={{ "--i": audienceIndex } as React.CSSProperties}
                    >
                      <span className={s.thumb} aria-hidden="true" />
                      {AUDIENCES.map((a) => (
                        <button
                          key={a.value}
                          type="button"
                          className={s.segment}
                          aria-pressed={audience === a.value}
                          onClick={() => setAudience(a.value)}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                    <div className={s.toolbarEnd}>
                      <p role="status" aria-live="polite" className={s.status}>
                        {results.length}{" "}
                        {results.length === 1 ? "answer" : "answers"}
                        {q && <> for “{query.trim()}”</>}
                      </p>
                      {results.length > 1 && (
                        <button
                          type="button"
                          className={s.textButton}
                          onClick={() =>
                            setOpenIds(
                              allOpen
                                ? new Set()
                                : new Set(results.map((r) => r.id)),
                            )
                          }
                        >
                          {allOpen ? "Collapse all" : "Expand all"}
                        </button>
                      )}
                    </div>
                  </div>

                  {groups.length > 1 && (
                    <nav
                      aria-label="Topics"
                      className={`sw-subnav ${s.chipNav}`}
                    >
                      <ul ref={chipsRef} className="sw-subnav-bar">
                        {groups.map((g) => (
                          <li key={g.id}>
                            <a
                              href={`#${topicAnchor(g.id)}`}
                              className="sw-subnav-link"
                              aria-current={
                                activeTopic === g.id ? "true" : undefined
                              }
                            >
                              {g.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  )}

                  <div className={s.groups}>
                    {groups.length === 0 ? (
                      <div className={s.empty}>
                        <span className={s.emptyIcon} aria-hidden="true">
                          <Search size={22} />
                        </span>
                        <h2>No answers match your search</h2>
                        <p>
                          Try a different word, show answers for everyone, or
                          send us your question.
                        </p>
                        <div className={s.emptyActions}>
                          <button
                            type="button"
                            className={`${lib.cta} ${lib.ctaPrimary}`}
                            onClick={clearFilters}
                          >
                            Clear search
                          </button>
                          <Link
                            href="/contact"
                            className={`${lib.cta} ${lib.ctaSecondary}`}
                          >
                            Ask a question
                          </Link>
                        </div>
                      </div>
                    ) : (
                      groups.map((group) => {
                        const number = numbers.get(group.id) ?? 0;
                        return (
                          <section
                            key={group.id}
                            id={topicAnchor(group.id)}
                            aria-labelledby={`${topicAnchor(group.id)}-title`}
                            className={s.group}
                          >
                            <header className={s.groupHead}>
                              <span className={s.groupNum} aria-hidden="true">
                                {String(number).padStart(2, "0")}
                              </span>
                              <h2
                                id={`${topicAnchor(group.id)}-title`}
                                className={s.groupTitle}
                              >
                                {group.label}
                              </h2>
                              <span className={s.groupCount}>
                                {group.items.length}{" "}
                                {group.items.length === 1
                                  ? "answer"
                                  : "answers"}
                              </span>
                            </header>

                            <ul className={s.list}>
                              {group.items.map((item) => {
                                const open = isOpen(item.id);
                                const related = (item.related_article_ids || [])
                                  .map((id) => byId.get(id))
                                  .filter(Boolean) as FAQItem[];
                                return (
                                  <li
                                    key={item.id}
                                    id={`faq-${item.id}`}
                                    className={`${s.item} ${open ? s.itemOpen : ""}`}
                                  >
                                    <h3 className={s.question}>
                                      <button
                                        type="button"
                                        className={s.trigger}
                                        aria-expanded={open}
                                        aria-controls={`faq-panel-${item.id}`}
                                        id={`faq-trigger-${item.id}`}
                                        onClick={() => toggle(item.id)}
                                      >
                                        <span className={s.questionText}>
                                          {highlight(
                                            item.question,
                                            query.trim(),
                                          )}
                                        </span>
                                        <span
                                          className={s.icon}
                                          aria-hidden="true"
                                        />
                                      </button>
                                    </h3>
                                    {/* Closed answers are inert, so their links are not reachable by keyboard. */}
                                    <div
                                      id={`faq-panel-${item.id}`}
                                      role="region"
                                      aria-labelledby={`faq-trigger-${item.id}`}
                                      className={s.panel}
                                      inert={!open ? true : undefined}
                                    >
                                      <div className={s.panelInner}>
                                        <p className={s.answer}>
                                          {highlight(item.answer, query.trim())}
                                        </p>
                                        {related.length > 0 && (
                                          <div className={s.related}>
                                            <p>Related</p>
                                            <ul>
                                              {related.map((r) => (
                                                <li key={r.id}>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      openRelated(r.id)
                                                    }
                                                  >
                                                    {r.question}
                                                    <ArrowRight
                                                      size={14}
                                                      aria-hidden="true"
                                                    />
                                                  </button>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        <div className={s.foot}>
                                          <button
                                            type="button"
                                            className={s.pill}
                                            onClick={() => copyLink(item.id)}
                                          >
                                            {copiedId === item.id ? (
                                              <Check
                                                size={15}
                                                aria-hidden="true"
                                              />
                                            ) : (
                                              <Link2
                                                size={15}
                                                aria-hidden="true"
                                              />
                                            )}
                                            <span aria-live="polite">
                                              {copiedId === item.id
                                                ? "Link copied"
                                                : "Copy link"}
                                            </span>
                                          </button>
                                          {item.escalation_route && (
                                            <Link
                                              href={ticketHref(
                                                item.escalation_route,
                                              )}
                                              className={s.footLink}
                                            >
                                              Still need help?
                                              <ArrowUpRight
                                                size={15}
                                                aria-hidden="true"
                                              />
                                            </Link>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </section>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <section className={lib.closing} aria-labelledby="still-heading">
          <div className={`${lib.container} ${lib.closingInner}`}>
            <div className={lib.closingTitle}>
              <span className={lib.closingIcon} aria-hidden="true">
                <MessageCircleQuestion size={24} />
              </span>
              <h2 id="still-heading">Still have a question?</h2>
            </div>
            <p>
              {isAuthenticated
                ? "Open a support ticket for help with your account or a course, or send us a general message."
                : "Send us a message and we will reply by email. Learners can also sign in to open a support ticket."}
            </p>
            <div className={lib.closingActions}>
              {isAuthenticated ? (
                <>
                  <Link href={ticketHref()} className={lib.closingGold}>
                    Open a support ticket{" "}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                  <Link href="/contact" className={lib.closingGhost}>
                    Send a message
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/contact" className={lib.closingGold}>
                    Send us a message{" "}
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                  <Link href={ticketHref()} className={lib.closingGhost}>
                    Sign in for support
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
