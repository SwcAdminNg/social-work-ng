import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, CalendarClock, Clock3, PlayCircle } from "lucide-react";
import { getCourseDurationLabel } from "@/lib/courseDuration";
import { type CatalogueCourse, fallbackImage, levelLabel, priceLabel, summaryOf } from "./courseFormat";
import s from "./Catalogue.module.css";

export default function CatalogueCard({ course, enrolled }: { course: CatalogueCourse; enrolled: boolean }) {
  const href = `/courses/${course.slug || course.id}`;
  const canContinue = enrolled && course.has_access !== false;
  const level = levelLabel(course.level);
  const price = priceLabel(course);
  const duration = getCourseDurationLabel(course);
  const summary = summaryOf(course.description);
  const titleId = `course-${course.id}`;
  const action = canContinue
    ? { label: course.is_completed ? "Review Course" : "Continue Learning", href: `/learn/${course.id}`, icon: PlayCircle }
    : { label: "View Course", href, icon: ArrowRight };
  const ActionIcon = action.icon;

  return (
    <article className={s.card} aria-labelledby={titleId}>
      <div className={s.media}>
        <Image
          src={course.thumbnail_url || fallbackImage(course.id)}
          alt=""
          fill
          sizes="(min-width: 1100px) 360px, (min-width: 700px) 45vw, 100vw"
          unoptimized={Boolean(course.thumbnail_url)}
        />
        {canContinue && <span className={s.mediaTag}>{course.is_completed ? "Completed" : "Enrolled"}</span>}
      </div>
      <div className={s.body}>
        {level && (
          <div className={s.tags}>
            <span className={s.tag}>{level}</span>
            {course.access_mode === "SCHEDULED" && <span className={`${s.tag} ${s.tagMuted}`}>Scheduled dates</span>}
          </div>
        )}
        <h3 id={titleId} className={s.title}>
          <Link href={href}>{course.title}</Link>
        </h3>
        {summary && <p className={s.summary}>{summary}</p>}

        {/* Only verified facts the course record holds; unknown values are left out. */}
        {(duration || course.certificate_enabled || course.access_mode) && (
          <ul className={s.facts}>
            {duration && (
              <li>
                <Clock3 size={15} aria-hidden="true" /> {duration} of study
              </li>
            )}
            {course.access_mode === "SELF_PACED" && (
              <li>
                <CalendarClock size={15} aria-hidden="true" /> Self-paced online
              </li>
            )}
            {course.certificate_enabled && (
              <li>
                <Award size={15} aria-hidden="true" /> Certificate on completion
              </li>
            )}
          </ul>
        )}

        <div className={s.foot}>
          <span className={s.price}>
            {canContinue ? <span className={s.priceNote}>You have access</span> : price ?? <span className={s.priceNote}>See course for fee</span>}
          </span>
          <Link href={action.href} className={s.action} aria-label={`${action.label}: ${course.title}`}>
            {action.label} <ActionIcon size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
