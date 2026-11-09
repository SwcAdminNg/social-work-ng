import Form from "next/form";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, RotateCw, Search, UsersRound, X } from "lucide-react";
import CatalogueCard from "./CatalogueCard";
import FiltersPanel from "./FiltersPanel";
import { COSTS, LEVELS, type CatalogueCourse, type CourseCatalog } from "./courseFormat";
import PageHero from "@/components/site/PageHero";
import { Btn } from "@/components/site/ui";
import { photos } from "@/lib/photos";
import lib from "@/components/resources/library/Library.module.css";
import s from "./Catalogue.module.css";

export type CatalogueQuery = { search: string; topic: string; level: string; cost: string; page: number };

type Props = {
  query: CatalogueQuery;
  courses: CatalogueCourse[];
  ok: boolean;
  total: number;
  totalPages: number;
  topics: CourseCatalog[];
  enrolledIds: string[];
};

function buildHref(query: CatalogueQuery, changes: Partial<CatalogueQuery>) {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  if (next.search) params.set("search", next.search);
  if (next.topic) params.set("topic", next.topic);
  if (next.level) params.set("level", next.level);
  if (next.cost) params.set("cost", next.cost);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/courses?${qs}#catalogue` : "/courses#catalogue";
}

export default function CourseCatalogue({ query, courses, ok, total, totalPages, topics, enrolledIds }: Props) {
  const filtered = Boolean(query.search || query.topic || query.level || query.cost);
  const catalogueEmpty = ok && !filtered && total === 0;
  const activeCount = [query.topic, query.level, query.cost].filter(Boolean).length;
  const enrolled = new Set(enrolledIds);

  const topicName = topics.find((t) => t.slug === query.topic)?.name;
  const levelName = LEVELS.find((l) => l.value === query.level)?.label;
  const costName = COSTS.find((c) => c.value === query.cost)?.label;
  const summary = [topicName, levelName, costName, query.search && `matching “${query.search}”`].filter(Boolean).join(" · ");

  const filters = [
    ...(topics.length > 0
      ? [{
          name: "topic",
          label: "Topic",
          value: query.topic,
          allLabel: "All topics",
          options: topics.map((t) => ({ value: t.slug, label: t.name })),
        }]
      : []),
    { name: "level", label: "Level", value: query.level, allLabel: "All levels", options: LEVELS.map((l) => ({ value: l.value, label: l.label })) },
    { name: "cost", label: "Cost", value: query.cost, allLabel: "Free and paid", options: COSTS.map((c) => ({ value: c.value, label: c.label })) },
  ];

  return (
    <>
      <PageHero
        id="courses-heading"
        eyebrow="Our courses"
        title="Build your knowledge and *strengthen* your social work practice"
        lead="Explore practical learning from Social Work Consultancy Ltd for social work students, practitioners and those supporting children, families and communities. Find learning that connects professional knowledge with the realities of practice in Nigeria and the Global South."
        photo={photos.atWork}
        position="50% 26%"
        compact
      >
        <Btn href="#catalogue" variant="gold">Browse Courses</Btn>
        <Btn href="/contact?topic=course" variant="ghost">Need Help Choosing?</Btn>
      </PageHero>

      <div className={`${lib.page} ${s.page} sw-sheet pt-6 md:pt-10`}>
      {!catalogueEmpty && ok && (
        <section className={`${lib.toolbar} ${lib.container}`} aria-label="Search and filter courses">
          <Form action="/courses" scroll={false} className={lib.searchForm} role="search">
            <label htmlFor="course-search" className="sr-only">
              Search courses
            </label>
            <div className="swf-search">
              <Search size={20} aria-hidden="true" />
              <input
                key={query.search}
                id="course-search"
                name="search"
                type="search"
                placeholder="Search by course title or topic"
                defaultValue={query.search}
                autoComplete="off"
                enterKeyHint="search"
              />
              <button type="submit" className="sw-btn">
                <span>Search</span>
                <span className="sw-btn-dot" aria-hidden="true">
                  <Search size={16} />
                </span>
              </button>
            </div>
            <FiltersPanel filters={filters} activeCount={activeCount} clearHref="/courses#catalogue" />
            {query.level && (
              <p className={s.levelHelp}>
                {LEVELS.find((l) => l.value === query.level)?.label}:{" "}
                {LEVELS.find((l) => l.value === query.level)?.description}
              </p>
            )}
          </Form>
        </section>
      )}

      <section id="catalogue" className={`${lib.library} ${lib.container}`} aria-labelledby="catalogue-heading" style={{ scrollMarginTop: 96 }}>
        <div className={lib.libraryHead}>
          <h2 id="catalogue-heading">Explore our courses</h2>
          {ok && !catalogueEmpty && (
            <div className={lib.resultMeta}>
              <p role="status" aria-live="polite">
                {total} {total === 1 ? "course" : "courses"}
                {summary && <> · {summary}</>}
              </p>
              {filtered && (
                <Link href="/courses#catalogue" className={lib.clearLink} scroll={false}>
                  <X size={16} aria-hidden="true" /> Clear all
                </Link>
              )}
            </div>
          )}
        </div>

        {!ok ? (
          <div className={lib.state} role="alert">
            <h3>We could not load the courses.</h3>
            <p>Please try again. If the problem continues, contact support.</p>
            <div className={lib.stateActions}>
              <Link href={buildHref(query, {})} className={`${lib.cta} ${lib.ctaPrimary}`}>
                <RotateCw size={17} aria-hidden="true" /> Retry
              </Link>
              <Link href="/contact?topic=account" className={`${lib.cta} ${lib.ctaSecondary}`}>
                Contact support
              </Link>
            </div>
          </div>
        ) : catalogueEmpty ? (
          <div className={lib.state}>
            <div className={lib.stateMedia}>
              <Image src="/images/ng/learning-together.webp" alt="Two colleagues look at a laptop together." fill sizes="840px" quality={90} />
            </div>
            <h3>New courses are being prepared.</h3>
            <p>Register your interest to be notified when learning becomes available.</p>
            <div className={lib.stateActions}>
              <Link href="/contact?topic=course" className={`${lib.cta} ${lib.ctaPrimary}`}>
                Register Interest <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className={lib.state}>
            <h3>No courses match your search.</h3>
            <p>Try another keyword or clear your filters.</p>
            <div className={lib.stateActions}>
              <Link href="/courses#catalogue" className={`${lib.cta} ${lib.ctaPrimary}`} scroll={false}>
                Clear your filters
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className={lib.grid}>
              {courses.map((course) => (
                <li key={course.id}>
                  <CatalogueCard course={course} enrolled={course.is_enrolled === true || enrolled.has(course.id)} />
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <nav className={lib.pager} aria-label="Course pages">
                <Link
                  href={buildHref(query, { page: query.page - 1 })}
                  className={lib.pagerLink}
                  aria-disabled={query.page <= 1}
                  tabIndex={query.page <= 1 ? -1 : undefined}
                  scroll={false}
                >
                  <ChevronLeft size={18} aria-hidden="true" /> Previous
                </Link>
                <span className={lib.pagerStatus}>
                  Page {query.page} of {totalPages}
                </span>
                <Link
                  href={buildHref(query, { page: query.page + 1 })}
                  className={lib.pagerLink}
                  aria-disabled={query.page >= totalPages}
                  tabIndex={query.page >= totalPages ? -1 : undefined}
                  scroll={false}
                >
                  Next <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </nav>
            )}
          </>
        )}
      </section>

      <section className={lib.closing} aria-labelledby="choose-heading">
        <div className={`${lib.container} ${lib.closingInner}`}>
          <div className={lib.closingTitle}>
            <span className={lib.closingIcon} aria-hidden="true">
              <UsersRound size={24} />
            </span>
            <h2 id="choose-heading">Need help choosing your learning?</h2>
          </div>
          <p>Get tailored guidance on your professional development journey through mentorship, or ask us about a course.</p>
          <div className={lib.closingActions}>
            <Link href="/mentorship" className={lib.closingGold}>
              Explore Mentorship <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/contact?topic=course" className={lib.closingGhost}>
              Ask about a course
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
