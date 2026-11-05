import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LifeBuoy,
  RotateCw,
  Star,
} from "lucide-react";
import { fetchApi } from "@/lib/fetchApi";
import { getCourseDurationLabel } from "@/lib/courseDuration";
import { estimateTotalWithTax, formatNaira } from "@/lib/paymentTax";
import { CourseReviews } from "@/components/courses/CourseReviews";
import { CourseResourcesSection } from "@/components/resources/CourseResourcesSection";
import { fallbackImage, levelLabel, priceLabel, type CatalogueCourse } from "@/components/courses/catalogue/courseFormat";
import lib from "@/components/resources/library/Library.module.css";
import s from "@/components/courses/detail/CourseDetail.module.css";
import { CourseCurriculum } from "./CourseCurriculum";
import { EnrollButton } from "./EnrollButton";

type Instructor = { name: string; profile_picture_url?: string | null };
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://socialworknigeria.org";

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
  if (!course) return { title: "Course not found | Social Work Consultancy Ltd" };
  const description = plainText(course.description).slice(0, 160) || `${course.title} from Social Work Consultancy Ltd.`;
  const url = `/courses/${course.slug || course.id}`;
  const image = course.thumbnail_url || fallbackImage(course.id);
  return {
    title: `${course.title} | Social Work Consultancy Ltd`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: course.title, description, images: [image] },
    twitter: { card: "summary_large_image", title: course.title, description, images: [image] },
  };
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const formatDate = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : dateFormat.format(d);
};

export default async function CourseDetailsPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const { status, course } = await loadCourse(slug);
  if (status === 404) notFound();

  if (!course) {
    return (
      <div className={lib.page}>
        <div className={lib.container} style={{ paddingBlock: 64 }}>
          <div className={lib.state} role="alert">
            <h1 style={{ fontSize: "1.4rem" }}>We could not load this course.</h1>
            <p>Please try again. If the problem continues, contact support.</p>
            <div className={lib.stateActions}>
              <Link href={`/courses/${encodeURIComponent(slug)}`} className={`${lib.cta} ${lib.ctaPrimary}`}>
                <RotateCw size={17} aria-hidden="true" /> Retry
              </Link>
              <Link href="/courses" className={`${lib.cta} ${lib.ctaSecondary}`}>Back to courses</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: plainText(course.description) || course.title,
    url: `${BASE_URL}/courses/${course.slug || course.id}`,
    provider: { "@type": "Organization", name: "Social Work Consultancy Ltd", sameAs: BASE_URL },
    ...(course.thumbnail_url ? { image: course.thumbnail_url } : {}),
    ...(price
      ? { offers: { "@type": "Offer", category: course.is_free ? "Free" : "Paid", price: course.is_free ? 0 : course.price, priceCurrency: "NGN" } }
      : {}),
  };

  return (
    <div className={`${lib.page} ${s.page}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={s.hero} aria-labelledby="course-title">
        <div className={`${lib.container} ${s.heroInner}`}>
          <div>
            <Link href="/courses" className={s.back}>
              <ArrowLeft size={16} aria-hidden="true" /> Back to courses
            </Link>
            <div className={s.tags}>
              {level && <span className={s.tag}><GraduationCap size={14} aria-hidden="true" /> {level}</span>}
              {course.certificate_enabled && <span className={s.tag}><Award size={14} aria-hidden="true" /> Certificate on completion</span>}
              {hasAccess && <span className={s.tag}><CheckCircle2 size={14} aria-hidden="true" /> {course.is_completed ? "Completed" : "Enrolled"}</span>}
            </div>
            <h1 id="course-title">{course.title}</h1>
            {course.description && <p className={s.summary}>{plainText(course.description)}</p>}
            {typeof course.total_reviews === "number" && course.total_reviews > 0 && (
              <p className={s.rating}>
                <Star size={16} aria-hidden="true" />
                {Number(course.average_rating || 0).toFixed(1)} from {course.total_reviews}{" "}
                {course.total_reviews === 1 ? "learner review" : "learner reviews"}
              </p>
            )}
          </div>
          <div className={s.media}>
            <Image
              src={course.thumbnail_url || fallbackImage(course.id)}
              alt=""
              fill
              priority
              sizes="(min-width: 960px) 40vw, 100vw"
              unoptimized={Boolean(course.thumbnail_url)}
            />
          </div>
        </div>
      </section>

      <div className={`${lib.container} ${s.layout}`}>
        <div className={s.main}>
          {(course.prerequisite || requirements.length > 0) && (
            <section className={s.block} aria-labelledby="audience-heading">
              <h2 id="audience-heading" className={s.blockTitle}>Who this course is for</h2>
              {course.prerequisite && <p className={s.prose}>{plainText(course.prerequisite)}</p>}
              {requirements.length > 0 && (
                <>
                  <p className={s.prose} style={{ marginTop: course.prerequisite ? 12 : 0, fontWeight: 600 }}>Before you start</p>
                  <ul className={s.list} style={{ marginTop: 8 }}>
                    {requirements.map((r) => <li key={r}>{r}</li>)}
                  </ul>
                </>
              )}
            </section>
          )}

          {outcomes.length > 0 && (
            <section className={s.block} aria-labelledby="outcomes-heading">
              <h2 id="outcomes-heading" className={s.blockTitle}>What you will learn</h2>
              <ul className={s.outcomes}>
                {outcomes.map((o) => (
                  <li key={o}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={s.block} aria-labelledby="curriculum-heading">
            <h2 id="curriculum-heading" className={s.blockTitle}>Course outline</h2>
            <CourseCurriculum courseId={course.id} sections={course.sections as never} />
          </section>

          {instructors.length > 0 && (
            <section className={s.block} aria-labelledby="instructors-heading">
              <h2 id="instructors-heading" className={s.blockTitle}>{instructors.length === 1 ? "Instructor" : "Instructors"}</h2>
              <ul className={s.instructors}>
                {instructors.map((i) => (
                  <li key={i.name} className={s.instructor}>
                    <span className={s.avatar} aria-hidden="true">
                      {i.profile_picture_url ? <Image src={i.profile_picture_url} alt="" fill sizes="44px" unoptimized /> : i.name.charAt(0)}
                    </span>
                    <span>{i.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <CourseResourcesSection courseId={course.id} />
          <CourseReviews courseId={course.id} />
        </div>

        <aside className={s.aside} aria-label="Enrolment">
          <div className={s.card}>
            <div>
              <p className={s.price}>{hasAccess ? "Enrolled" : price ?? "Fee to be confirmed"}</p>
              <p className={s.priceNote} style={{ marginTop: 6 }}>
                {hasAccess
                  ? "You have access to this course. Continue where you left off."
                  : course.is_free
                    ? "No fee. Sign in or create a free account to enrol."
                    : price
                      ? `Course fee before VAT. With 7.5% VAT you pay ${formatNaira(estimateTotalWithTax(course.price ?? 0).totalWithTax)} at checkout.`
                      : "Contact us for the fee before enrolling."}
              </p>
            </div>
            <div className={s.desktopOnly}>{enroll()}</div>

            {/* Only facts held on the course record. */}
            <ul className={s.facts}>
              {duration && (
                <li><Clock3 size={18} aria-hidden="true" /><span><span className={s.factLabel}>Study time</span>About {duration}</span></li>
              )}
              {course.access_mode && (
                <li>
                  <CalendarClock size={18} aria-hidden="true" />
                  <span>
                    <span className={s.factLabel}>Delivery</span>
                    {course.access_mode === "SCHEDULED"
                      ? `Online, on scheduled dates${start ? ` from ${start}` : ""}${end ? ` to ${end}` : ""}`
                      : "Online and self-paced"}
                  </span>
                </li>
              )}
              {course.certificate_enabled && (
                <li>
                  <Award size={18} aria-hidden="true" />
                  <span>
                    <span className={s.factLabel}>Certificate</span>
                    Certificate of completion from Social Work Consultancy Ltd
                    {typeof passMark === "number" && passMark > 0 ? ` when you achieve an overall score of ${passMark}% or more` : ""}.
                  </span>
                </li>
              )}
              {includes.length > 0 && (
                <li>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span><span className={s.factLabel}>Includes</span>{includes.join(", ")}</span>
                </li>
              )}
            </ul>
            <p className={s.support}>
              <LifeBuoy size={14} aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 6 }} />
              Questions before enrolling? <Link href="/contact?topic=course">Contact us</Link>.
            </p>
          </div>
        </aside>
      </div>

      <div className={s.mobileBar}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <span className={s.factLabel}>Course access</span>
          <p className={s.price}>{hasAccess ? "Enrolled" : price ?? "Fee to be confirmed"}</p>
        </div>
        <div className={s.mobileBarAction}>{enroll(true)}</div>
      </div>
    </div>
  );
}
