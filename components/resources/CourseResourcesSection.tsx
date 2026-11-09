import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import LibraryCard from "@/components/resources/library/LibraryCard";
import lib from "@/components/resources/library/Library.module.css";
import { getCourseResources } from "@/lib/resources";

/** Up to three resources attached to a course. Renders nothing when there are none. */
export async function CourseResourcesSection({ courseId }: { courseId: string }) {
  const { items, ok } = await getCourseResources(courseId, { pageSize: 3 });

  if (!ok || items.length === 0) return null;

  return (
    <section id="resources" className="scroll-mt-40" aria-labelledby="course-resources-heading">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="course-resources-heading" className="sw-display m-0 text-[clamp(1.8rem,3vw,2.5rem)] text-ink">
            Resources
          </h2>
          <p className="m-0 mt-2 text-ink-2">
            Supplementary templates, readings, and reference material attached to this course.
          </p>
        </div>
        <Link href={`/resources?course_id=${courseId}`} className="sw-link text-accent">
          View all
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <ul className={`${lib.page} m-0 grid list-none gap-5 bg-transparent p-0 md:grid-cols-2`}>
        {items.map((resource) => (
          <li key={resource.id}>
            <LibraryCard resource={resource} />
          </li>
        ))}
      </ul>
    </section>
  );
}
