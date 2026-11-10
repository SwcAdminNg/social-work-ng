import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BadgeCheck,
  CalendarClock,
  Check,
  Clock3,
  GraduationCap,
  LifeBuoy,
  ListChecks,
  PackageCheck,
  RotateCw,
  Star,
} from "lucide-react";
import { auth } from "@/auth";
import { fetchApi } from "@/lib/fetchApi";
import { getCourseDurationLabel } from "@/lib/courseDuration";
import { estimateTotalWithTax, formatNaira } from "@/lib/paymentTax";
import { CourseReviews } from "@/components/courses/CourseReviews";
import { CourseResourcesSection } from "@/components/resources/CourseResourcesSection";
import { fallbackImage, levelLabel, priceLabel, type CatalogueCourse } from "@/components/courses/catalogue/courseFormat";
import JsonLd from "@/components/site/JsonLd";
import SectionNav, { type SectionLink } from "@/components/site/SectionNav";
import { Btn, Contours, Eyebrow, Heading, TextLink, type Vars } from "@/components/site/ui";
import { absoluteUrl, breadcrumbNode, organizationId, pageMetadata, webPageNode } from "@/lib/site";
import { CourseCurriculum } from "./CourseCurriculum";
import { EnrollButton } from "./EnrollButton";

type Instructor = { name: string; profile_picture_url?: string | null };
type OutlineSection = { id: string; title: string; items?: { item_type?: string | null }[] | null };
type CourseDetail = CatalogueCourse & {
  id: string;
  prerequisite?: string | null;
  what_you_will_learn?: string[];
  material_includes?: string[];
  requirements?: string[];
  instructors?: Instructor[];
  access_start_date?: string | null;
  access_end_date?: string | null;
  certificate_pass_mark_percentage?: number;
  current_version_label?: string | null;
  sections?: unknown;
};

async function loadCourse(slug: string) {
  const res = await fetchApi(`/courses/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } }).catch(() => null);
  if (!res) return { status: 0, course: null as CourseDetail | null };
  const json = await res.json().catch(() => null);
  return { status: res.status, course: (json?.data ?? null) as CourseDetail | null };
}

function plainText(text?: string | null) {
  return (text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const { course } = await loadCourse(slug);
  if (!course) return { title: "Course not found | Social Work Consultancy Ltd", robots: { index: false, follow: true } };
  const description = plainText(course.description).slice(0, 160) || `${course.title} from Social Work Consultancy Ltd.`;
  return pageMetadata({
    title: `${course.title} | Social Work Consultancy Ltd`,
    description,
    path: `/courses/${course.slug || course.id}`,
    image: course.thumbnail_url || "courses",
  });
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const formatDate = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : dateFormat.format(d);
};

const SUMMARY_LENGTH = 240;
const sectionHeading = "sw-display m-0 text-[clamp(1.8rem,3vw,2.5rem)] text-ink";

export default async function CourseDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const { status, course } = await loadCourse(slug);
  if (status === 404) notFound();

  if (!course) {
    return (
      <div className="bg-paper">
        <div className="sw-wrap py-24 md:py-32">
          <div role="alert" className="mx-auto max-w-xl rounded-[32px] border border-dashed border-line bg-card p-10 text-center">
            <h1 className="sw-display m-0 text-[2rem] text-ink">We could not load this course.</h1>
            <p className="m-0 mt-3 text-ink-2">Please try again. If the problem continues, contact support.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href={`/courses/${encodeURIComponent(slug)}`} className="sw-btn justify-center gap-2 px-6" data-no-curtain>
                <RotateCw size={17} aria-hidden="true" /> Retry
              </Link>
              <Btn href="/courses" variant="ghost" className="text-ink">Back to courses</Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const signedIn = Boolean(await auth());
  const level = levelLabel(course.level);
  const price = priceLabel(course);
  const duration = getCourseDurationLabel(course);
  const hasAccess = course.has_access === true || course.is_enrolled === true;
  const outcomes = (course.what_you_will_learn || []).filter(Boolean);
  const includes = (course.material_includes || []).filter(Boolean);
  const requirements = (course.requirements || []).filter(Boolean);
  const instructors = (course.instructors || []).filter((i) => i?.name);
  const start = formatDate(course.access_start_date);
  const end = formatDate(course.access_end_date);
  const passMark = course.certificate_pass_mark_percentage;
  const sections = (Array.isArray(course.sections) ? course.sections : []) as OutlineSection[];
  const lessonCount = sections.reduce((sum, section) => sum + (section.items?.length || 0), 0);
  const reviewCount = typeof course.total_reviews === "number" ? course.total_reviews : 0;
  const image = course.thumbnail_url || fallbackImage(course.id);

  // The opening carries a short summary; the full text sits under "About".
  const description = plainText(course.description);
  const isLong = description.length > SUMMARY_LENGTH;
  const summary = isLong ? `${description.slice(0, SUMMARY_LENGTH).replace(/\s+\S*$/, "")}…` : description;
  const hasAbout = isLong || Boolean(course.prerequisite) || requirements.length > 0;

  const priceText = hasAccess ? "Enrolled" : price ?? "Fee to be confirmed";
  const delivery =
    course.access_mode === "SCHEDULED" ? "Scheduled dates" : course.access_mode ? "Self-paced" : null;

  const enroll = (compact = false) => (
    <EnrollButton
      courseId={course.id}
      isEnrolled={Boolean(course.is_enrolled)}
      isFree={Boolean(course.is_free)}
      price={course.price ?? undefined}
      hasAccess={course.has_access ?? undefined}
      isCompleted={course.is_completed ?? undefined}
      compact={compact}
    />
  );

  const nav: SectionLink[] = [
    ...(hasAbout ? [{ id: "about", label: "About" }] : []),
    ...(outcomes.length > 0 ? [{ id: "outcomes", label: "What you will learn" }] : []),
    { id: "outline", label: "Course outline" },
    ...(instructors.length > 0 ? [{ id: "instructors", label: instructors.length === 1 ? "Instructor" : "Instructors" }] : []),
    ...(reviewCount > 0 ? [{ id: "reviews", label: "Reviews" }] : []),
  ];

  const stats = [
    level && { icon: GraduationCap, label: "Level", value: level },
    duration && { icon: Clock3, label: "Study time", value: `About ${duration}` },
    lessonCount > 0 && { icon: ListChecks, label: "Lessons", value: `${lessonCount} in ${sections.length} ${sections.length === 1 ? "section" : "sections"}` },
    delivery && { icon: CalendarClock, label: "Delivery", value: `Online, ${delivery.toLowerCase()}` },
    course.certificate_enabled && { icon: Award, label: "Certificate", value: "On completion" },
  ].filter(Boolean) as { icon: typeof Award; label: string; value: string }[];

  const coursePath = `/courses/${course.slug || course.id}`;
  const nodes = [
    webPageNode({
      path: coursePath,
      name: course.title,
      description: description || course.title,
      extra: {
        mainEntity: {
          "@type": "Course",
          name: course.title,
          description: description || course.title,
          url: absoluteUrl(coursePath),
          provider: { "@id": organizationId },
          ...(course.thumbnail_url ? { image: course.thumbnail_url } : {}),
          ...(level ? { educationalLevel: level } : {}),
          ...(reviewCount > 0
            ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(course.average_rating || 0).toFixed(1), reviewCount } }
            : {}),
          ...(price
            ? { offers: { "@type": "Offer", category: course.is_free ? "Free" : "Paid", price: course.is_free ? 0 : course.price, priceCurrency: "NGN" } }
            : {}),
        },
      },
    }),
    breadcrumbNode(coursePath, [
      { name: "Courses", path: "/courses" },
      { name: course.title, path: coursePath },
    ]),
  ];

  return (
    <div>
      <JsonLd nodes={nodes} />

      {/* ── Opening ── */}
      <section
        aria-labelledby="course-title"
        data-progress="view"
        className="sw-on-dark sw-grain relative -mt-[var(--nav-h)] overflow-hidden bg-forest pb-24 pt-[var(--nav-h)] md:pb-32"
      >
        <Contours className="text-leaf" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-brand/40 blur-[150px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 h-[400px] w-[400px] rounded-full bg-clay/25 blur-[140px]" />

        <div className="sw-wrap relative pt-6 md:pt-10">
          <div data-reveal>
            <Link
              href="/courses"
              className="group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/20 px-4 text-sm font-semibold text-white no-underline transition-colors duration-300 hover:border-white/60"
            >
              <ArrowLeft size={16} aria-hidden="true" className="transition-transform duration-500 ease-sw group-hover:-translate-x-1" />
              All courses
            </Link>
          </div>

          <div className="mt-8 grid items-center gap-x-14 gap-y-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <ul data-reveal className="m-0 flex list-none flex-wrap gap-2 p-0">
                {level && (
                  <li className="sw-chip bg-white/10 text-white backdrop-blur">
                    <GraduationCap size={14} className="text-gold-light" aria-hidden="true" /> {level}
                  </li>
                )}
                {course.certificate_enabled && (
                  <li className="sw-chip bg-white/10 text-white backdrop-blur">
                    <Award size={14} className="text-gold-light" aria-hidden="true" /> Certificate on completion
                  </li>
                )}
                {hasAccess && (
                  <li className="sw-chip bg-gold text-[#10231a]">
                    <BadgeCheck size={14} aria-hidden="true" /> {course.is_completed ? "Completed" : "Enrolled"}
                  </li>
                )}
              </ul>

              <Heading
                as="h1"
                id="course-title"
                text={course.title.replace(/\*/g, "")}
                delay={0.35}
                className="sw-display m-0 mt-6 text-[clamp(2.4rem,5.2vw,4.6rem)] text-[#fffdf4]"
              />
              {summary && (
                <p data-reveal style={{ "--d": "0.7s" } as Vars} className="sw-lead m-0 mt-6 max-w-[38rem] text-white/80">
                  {summary}
                </p>
              )}
              {reviewCount > 0 && (
                <p data-reveal style={{ "--d": "0.78s" } as Vars} className="m-0 mt-5 flex flex-wrap items-center gap-2.5 text-[0.95rem] text-white/80">
                  <span className="flex items-center gap-0.5" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.round(Number(course.average_rating || 0)) ? "fill-gold text-gold" : "fill-transparent text-white/30"}
                      />
                    ))}
                  </span>
                  <a href="#reviews" className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
                    {Number(course.average_rating || 0).toFixed(1)} from {reviewCount} {reviewCount === 1 ? "learner review" : "learner reviews"}
                  </a>
                </p>
              )}

              <div data-reveal style={{ "--d": "0.9s" } as Vars} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-5">
                <div className="w-full sm:w-[17.5rem] [&_.sw-btn]:[--btn-bg:var(--sw-gold)] [&_.sw-btn]:[--btn-fg:#10231a] [&_.sw-btn:hover]:[--btn-bg:var(--sw-gold-light)]">
                  {enroll()}
                </div>
                <TextLink href="#outline" className="text-white">See the course outline</TextLink>
              </div>
            </div>

            {/* Course image */}
            <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none" data-reveal="clip" style={{ "--d": "0.5s" } as Vars}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-night md:rounded-[44px]">
                <Image
                  src={image}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 46vw, 92vw"
                  quality={90}
                  unoptimized={Boolean(course.thumbnail_url)}
                  className="object-cover"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent" />
                <span className="absolute bottom-5 left-5 flex items-end gap-3">
                  <span className="rounded-2xl bg-white px-4 py-2.5 text-[#10231a] shadow-lg">
                    <span className="sw-cap block text-[#10231a]/60">{hasAccess ? "Course access" : "Course fee"}</span>
                    <span className="sw-display block text-[1.6rem]">{priceText}</span>
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Facts at a glance */}
          {stats.length > 0 && (
            <dl
              data-reveal
              style={{ "--d": "1s" } as Vars}
              className="m-0 mt-14 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/15 pt-8 md:mt-20 md:flex md:flex-wrap md:justify-between"
            >
              {stats.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3.5">
                  <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/10 text-gold-light">
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="sw-cap text-white/55">{label}</dt>
                    <dd className="m-0 mt-1 text-[1.02rem] font-medium text-white">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* ── Body ── */}
      <div className="sw-sheet bg-paper pb-24 pt-10 md:pb-32 md:pt-14">
        <div className="sw-wrap grid items-start gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0">
            <SectionNav items={nav} label="Sections of this course page" />

            <div className="mt-12 grid gap-20 md:mt-16 md:gap-24">
              {hasAbout && (
                <section id="about" className="scroll-mt-40" aria-labelledby="about-heading">
                  <div data-reveal>
                    <Eyebrow className="text-accent">About</Eyebrow>
                    <h2 id="about-heading" className={`${sectionHeading} mt-4`}>
                      Who this course is <em className="sw-em text-clay-ink">for</em>
                    </h2>
                  </div>
                  {isLong && (
                    <p data-reveal className="m-0 mt-6 max-w-3xl whitespace-pre-line text-[1.08rem] leading-relaxed text-ink-2">
                      {description}
                    </p>
                  )}
                  {course.prerequisite && (
                    <p data-reveal className="m-0 mt-6 max-w-3xl text-[1.08rem] leading-relaxed text-ink-2">
                      {plainText(course.prerequisite)}
                    </p>
                  )}
                  {requirements.length > 0 && (
                    <div data-reveal className="mt-8 rounded-[28px] bg-paper-2 p-7 md:p-8">
                      <h3 className="sw-title m-0 text-xl text-ink">Before you start</h3>
                      <ul className="m-0 mt-5 grid list-none gap-3.5 p-0">
                        {requirements.map((requirement) => (
                          <li key={requirement} className="flex items-start gap-3.5 text-[1.02rem] text-ink">
                            <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-deep text-gold-light">
                              <Check size={14} strokeWidth={3} aria-hidden="true" />
                            </span>
                            {requirement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}

              {outcomes.length > 0 && (
                <section id="outcomes" className="scroll-mt-40" aria-labelledby="outcomes-heading">
                  <div data-reveal>
                    <Eyebrow className="text-accent">Outcomes</Eyebrow>
                    <h2 id="outcomes-heading" className={`${sectionHeading} mt-4`}>
                      What you will <em className="sw-em text-clay-ink">learn</em>
                    </h2>
                  </div>
                  <ol className="m-0 mt-8 grid list-none gap-4 p-0 sm:grid-cols-2">
                    {outcomes.map((outcome, index) => (
                      <li
                        key={outcome}
                        data-reveal
                        style={{ "--d": `${Math.min(index, 5) * 0.06}s` } as Vars}
                        className="sw-card-hover flex gap-5 rounded-[24px] border border-line bg-card p-6"
                      >
                        <span className="sw-em flex-none text-[2.4rem] leading-none text-clay-ink" aria-hidden="true">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="pt-1 text-[1.05rem] leading-snug text-ink">{outcome}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <section id="outline" className="scroll-mt-40" aria-labelledby="outline-heading">
                <div data-reveal>
                  <Eyebrow className="text-accent">Curriculum</Eyebrow>
                  <h2 id="outline-heading" className={`${sectionHeading} mt-4`}>
                    Course <em className="sw-em text-clay-ink">outline</em>
                  </h2>
                </div>
                <div data-reveal className="mt-8">
                  <CourseCurriculum courseId={course.id} sections={course.sections as never} />
                </div>
              </section>

              {instructors.length > 0 && (
                <section id="instructors" className="scroll-mt-40" aria-labelledby="instructors-heading">
                  <div data-reveal>
                    <Eyebrow className="text-accent">Teaching</Eyebrow>
                    <h2 id="instructors-heading" className={`${sectionHeading} mt-4`}>
                      Your {instructors.length === 1 ? "instructor" : "instructors"}
                    </h2>
                  </div>
                  <ul className="m-0 mt-8 grid list-none gap-4 p-0 sm:grid-cols-2">
                    {instructors.map((instructor, index) => (
                      <li
                        key={instructor.name}
                        data-reveal
                        style={{ "--d": `${index * 0.08}s` } as Vars}
                        className="flex items-center gap-5 rounded-[24px] border border-line bg-card p-5"
                      >
                        <span className="relative grid h-[72px] w-[72px] flex-none place-items-center overflow-hidden rounded-full bg-mint text-2xl font-bold text-accent" aria-hidden="true">
                          {instructor.profile_picture_url ? (
                            <Image src={instructor.profile_picture_url} alt="" fill sizes="72px" unoptimized className="object-cover" />
                          ) : (
                            instructor.name.charAt(0)
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="sw-title block text-[1.25rem] text-ink">{instructor.name}</span>
                          <span className="sw-cap mt-1.5 block text-ink-3">Course instructor</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <CourseResourcesSection courseId={course.id} />

              <div id="reviews" className="scroll-mt-40 empty:hidden">
                <CourseReviews courseId={course.id} signedIn={signedIn} />
              </div>
            </div>
          </div>

          {/* ── Enrolment card ── */}
          <aside aria-label="Enrolment" className="lg:sticky lg:top-28" data-reveal style={{ "--d": "0.15s" } as Vars}>
            <div className="overflow-hidden rounded-[32px] border border-line bg-card shadow-[0_40px_80px_-56px_rgba(14,31,23,0.6)]">
              <div className="p-7 md:p-8">
                <p className="sw-cap m-0 text-ink-3">{hasAccess ? "Course access" : "Course fee"}</p>
                <p className="sw-display m-0 mt-2 text-[2.9rem] leading-none text-ink">{priceText}</p>
                <p className="m-0 mt-3 text-[0.95rem] leading-relaxed text-ink-2">
                  {hasAccess
                    ? "You have access to this course. Continue where you left off."
                    : course.is_free
                      ? "No fee. Sign in or create a free account to enrol."
                      : price
                        ? `Course fee before VAT. With 7.5% VAT you pay ${formatNaira(estimateTotalWithTax(course.price ?? 0).totalWithTax)} at checkout.`
                        : "Contact us for the fee before enrolling."}
                </p>
                <div className="mt-6 max-lg:hidden">{enroll()}</div>
              </div>

              {/* Only facts held on the course record. */}
              <ul className="m-0 grid list-none gap-5 border-t border-line bg-paper-2/60 p-7 md:p-8">
                {duration && <Fact icon={Clock3} label="Study time">About {duration}</Fact>}
                {course.access_mode && (
                  <Fact icon={CalendarClock} label="Delivery">
                    {course.access_mode === "SCHEDULED"
                      ? `Online, on scheduled dates${start ? ` from ${start}` : ""}${end ? ` to ${end}` : ""}`
                      : "Online and self-paced"}
                  </Fact>
                )}
                {course.certificate_enabled && (
                  <Fact icon={Award} label="Certificate">
                    Certificate of completion from Social Work Consultancy Ltd
                    {typeof passMark === "number" && passMark > 0 ? ` when you achieve an overall score of ${passMark}% or more` : ""}.
                  </Fact>
                )}
                {includes.length > 0 && <Fact icon={PackageCheck} label="Includes">{includes.join(", ")}</Fact>}
              </ul>

              <p className="m-0 flex items-center gap-2.5 border-t border-line px-7 py-5 text-[0.92rem] text-ink-2 md:px-8">
                <LifeBuoy size={16} className="flex-none text-accent" aria-hidden="true" />
                <span>
                  Questions before enrolling?{" "}
                  <Link href="/contact?topic=course" className="font-semibold text-accent underline underline-offset-4">
                    Contact us
                  </Link>
                  .
                </span>
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Closing ── */}
      <section className="bg-paper px-2.5 pb-28 sm:px-5 lg:pb-14" aria-labelledby="course-help-heading">
        <div
          data-progress="view"
          className="sw-grain relative overflow-hidden rounded-[32px] bg-[#b94a28] px-6 py-16 text-center text-white md:rounded-[48px] md:py-20"
        >
          <Contours className="text-white" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center">
            <Heading
              id="course-help-heading"
              text="Not sure this is the *right course?*"
              accent="text-gold-light"
              className="sw-display m-0 text-[clamp(2.1rem,4.8vw,3.9rem)]"
            />
            <p data-reveal className="sw-lead m-0 mt-5 max-w-xl text-white/85">
              Ask us about this course, or talk to a mentor about where you want your practice to go.
            </p>
            <div data-reveal className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Btn href="/contact?topic=course" variant="light">Ask about this course</Btn>
              <Btn href="/mentorship" variant="ghost">Explore Mentorship</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* Phones: the action stays within reach at the bottom of the screen. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-card/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <div className="min-w-0 flex-1">
          <span className="sw-cap block text-ink-3">{hasAccess ? "Course access" : "Course fee"}</span>
          <p className="sw-display m-0 truncate text-[1.4rem] text-ink">{priceText}</p>
        </div>
        <div className="w-[52%] max-w-[230px] flex-none [&_.sw-btn]:min-h-[3.25rem]">{enroll(true)}</div>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, children }: { icon: typeof Award; label: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-card text-accent shadow-sm">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0 text-[0.97rem] leading-snug text-ink">
        <span className="sw-cap mb-1 block text-ink-3">{label}</span>
        {children}
      </span>
    </li>
  );
}
