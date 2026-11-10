import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, GraduationCap, Link2, LockKeyhole, LockKeyholeOpen, PlayCircle, RotateCw } from "lucide-react";
import { ResourceAttachments } from "@/components/resources/ResourceAttachments";
import { categoryLabel } from "@/components/resources/library/LibraryCard";
import JsonLd from "@/components/site/JsonLd";
import { Btn, Contours, Eyebrow, Heading, TextLink, type Vars } from "@/components/site/ui";
import { photos } from "@/lib/photos";
import { getResource, type ResourceRead } from "@/lib/resources";
import { breadcrumbNode, organizationId, pageMetadata, webPageNode } from "@/lib/site";

const FALLBACK_DESCRIPTION = "Browse professional social work resources, templates, recordings, and practice material.";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const { resource, ok } = await getResource(slug);

  if (!ok || !resource) return { title: "Resource Not Found | Social Work Nigeria", robots: { index: false, follow: true } };

  return pageMetadata({
    title: `${resource.name} | Resources | Social Work Nigeria`,
    description: (resource.description || FALLBACK_DESCRIPTION).slice(0, 200),
    path: `/resources/${resource.slug || resource.id}`,
    image: resource.thumbnail_url || "resources",
  });
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });

function accessLine(resource: ResourceRead) {
  if (resource.visibility === "COURSE_ENROLLED") {
    return resource.course_title ? `Included with ${resource.course_title}` : "Included with a course";
  }
  if (resource.visibility === "LOGGED_IN") return "Free account required";
  return "Free public resource";
}

export default async function ResourceDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const { resource, status } = await getResource(slug);

  if (status === 404) notFound();

  if (!resource) {
    return (
      <div className="bg-paper">
        <div className="sw-wrap py-24 md:py-32">
          <div role="alert" className="mx-auto max-w-xl rounded-[32px] border border-dashed border-line bg-card p-10 text-center">
            <h1 className="sw-display m-0 text-[2rem] text-ink">We could not load this resource.</h1>
            <p className="m-0 mt-3 text-ink-2">Please try again. If the problem continues, contact support.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href={`/resources/${encodeURIComponent(slug)}`} className="sw-btn justify-center gap-2 px-6" data-no-curtain>
                <RotateCw size={17} aria-hidden="true" /> Retry
              </Link>
              <Btn href="/resources" variant="ghost" className="text-ink">Back to resources</Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const path = `/resources/${resource.slug || resource.id}`;
  const locked = resource.can_access === false;
  const attachments = resource.attachments || [];
  const count = (type: string) => attachments.filter((a) => a.attachment_type === type).length;
  const documents = attachments.length - count("VIDEO") - count("LINKS");
  const updated = new Date(resource.updated_at || resource.created_at || "");
  const updatedText = Number.isNaN(updated.getTime()) ? null : dateFormat.format(updated);
  const category = categoryLabel(resource.category);
  const description = resource.description || FALLBACK_DESCRIPTION;

  // What is inside, counted only when the visitor can see it.
  const contents = locked
    ? []
    : [
        documents > 0 && { icon: FileText, label: `${documents} ${documents === 1 ? "document" : "documents"}` },
        count("VIDEO") > 0 && { icon: PlayCircle, label: `${count("VIDEO")} ${count("VIDEO") === 1 ? "video" : "videos"}` },
        count("LINKS") > 0 && { icon: Link2, label: `${count("LINKS")} ${count("LINKS") === 1 ? "link" : "links"}` },
      ].filter(Boolean) as { icon: typeof FileText; label: string }[];

  return (
    <div>
      <JsonLd
        nodes={[
          webPageNode({
            path,
            name: resource.name,
            description,
            extra: {
              mainEntity: {
                "@type": "LearningResource",
                name: resource.name,
                description,
                learningResourceType: category,
                isAccessibleForFree: resource.visibility !== "COURSE_ENROLLED",
                provider: { "@id": organizationId },
                ...(resource.thumbnail_url ? { image: resource.thumbnail_url } : {}),
                ...(updatedText ? { dateModified: updated.toISOString() } : {}),
              },
            },
          }),
          breadcrumbNode(path, [
            { name: "Resources", path: "/resources" },
            { name: resource.name, path },
          ]),
        ]}
      />

      {/* ── Opening ── */}
      <section
        aria-labelledby="resource-title"
        data-progress="view"
        className="sw-on-dark sw-grain relative -mt-[var(--nav-h)] overflow-hidden bg-forest pb-24 pt-[var(--nav-h)] md:pb-32"
      >
        <Contours className="text-leaf" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-brand/40 blur-[150px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 h-[400px] w-[400px] rounded-full bg-clay/25 blur-[140px]" />

        <div className="sw-wrap relative pt-6 md:pt-10">
          <div data-reveal>
            <Link
              href="/resources"
              className="group inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/20 px-4 text-sm font-semibold text-white no-underline transition-colors duration-300 hover:border-white/60"
            >
              <ArrowLeft size={16} aria-hidden="true" className="transition-transform duration-500 ease-sw group-hover:-translate-x-1" />
              All resources
            </Link>
          </div>

          <div className="mt-8 grid items-center gap-x-14 gap-y-12 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              <ul data-reveal className="m-0 flex list-none flex-wrap gap-2 p-0">
                <li className="sw-chip bg-gold text-[#10231a]">{category}</li>
                <li className="sw-chip bg-white/10 text-white backdrop-blur">
                  {locked ? (
                    <LockKeyhole size={14} className="text-gold-light" aria-hidden="true" />
                  ) : (
                    <LockKeyholeOpen size={14} className="text-gold-light" aria-hidden="true" />
                  )}
                  {accessLine(resource)}
                </li>
              </ul>
              <Heading
                as="h1"
                id="resource-title"
                text={resource.name.replace(/\*/g, "")}
                delay={0.35}
                className="sw-display m-0 mt-6 text-[clamp(2.3rem,5vw,4.3rem)] text-[#fffdf4]"
              />
              {resource.description && (
                <p data-reveal style={{ "--d": "0.7s" } as Vars} className="sw-lead m-0 mt-6 max-w-[38rem] whitespace-pre-line text-white/80">
                  {resource.description}
                </p>
              )}
              <div data-reveal style={{ "--d": "0.85s" } as Vars} className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Btn href="#contents" variant="gold">{locked ? "How to get access" : "Open the resource"}</Btn>
                {resource.course_slug && <TextLink href={`/courses/${resource.course_slug}`} className="text-white">View the course</TextLink>}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none" data-reveal="clip" style={{ "--d": "0.5s" } as Vars}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-night md:rounded-[44px]">
                <Image
                  src={resource.thumbnail_url || photos.readingTea.src}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 46vw, 92vw"
                  quality={90}
                  unoptimized={Boolean(resource.thumbnail_url)}
                  className="object-cover"
                  style={resource.thumbnail_url ? undefined : { objectPosition: "70% 30%" }}
                />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/50 via-transparent to-transparent" />
              </div>
            </div>
          </div>

          {(contents.length > 0 || updatedText || resource.course_title) && (
            <dl
              data-reveal
              style={{ "--d": "1s" } as Vars}
              className="m-0 mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-white/15 pt-8 md:mt-20"
            >
              {contents.length > 0 && (
                <Stat icon={contents[0].icon} label="Inside">{contents.map((item) => item.label).join(" · ")}</Stat>
              )}
              {resource.course_title && <Stat icon={GraduationCap} label="Course">{resource.course_title}</Stat>}
              {updatedText && (
                <Stat icon={CalendarDays} label={resource.updated_at ? "Updated" : "Added"}>
                  <time dateTime={updated.toISOString()}>{updatedText}</time>
                </Stat>
              )}
            </dl>
          )}
        </div>
      </section>

      {/* ── Contents ── */}
      <section id="contents" className="sw-sheet scroll-mt-10 bg-paper pb-24 pt-16 md:pb-32 md:pt-24" aria-labelledby="contents-heading">
        <div className="sw-wrap grid gap-x-14 gap-y-10 lg:grid-cols-[0.42fr_1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start" data-reveal>
            <Eyebrow className="text-accent">{locked ? "Access" : "Contents"}</Eyebrow>
            <h2 id="contents-heading" className="sw-display m-0 mt-4 text-[clamp(1.9rem,3.4vw,2.9rem)] text-ink">
              {locked ? (
                <>
                  Unlock this <em className="sw-em text-clay-ink">resource</em>
                </>
              ) : (
                <>
                  What is <em className="sw-em text-clay-ink">inside</em>
                </>
              )}
            </h2>
            <p className="m-0 mt-4 max-w-sm text-[0.98rem] leading-relaxed text-ink-2">
              Check each item for its intended audience, source, publication or review date before you rely on it in
              practice.
            </p>
          </div>
          <ResourceAttachments resource={resource} />
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="bg-paper px-2.5 pb-10 sm:px-5 md:pb-14" aria-labelledby="resource-next-heading">
        <div
          data-progress="view"
          className="sw-grain relative overflow-hidden rounded-[32px] bg-[#b94a28] px-6 py-16 text-center text-white md:rounded-[48px] md:py-20"
        >
          <Contours className="text-white" />
          <div className="relative mx-auto flex max-w-3xl flex-col items-center">
            <Heading
              id="resource-next-heading"
              text="Put learning into *practice*"
              accent="text-gold-light"
              className="sw-display m-0 text-[clamp(2.1rem,4.8vw,3.9rem)]"
            />
            <p data-reveal className="sw-lead m-0 mt-5 max-w-xl text-white/85">
              Explore courses and mentorship to build on your reading and reflection.
            </p>
            <div data-reveal className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Btn href="/courses" variant="light">Explore Courses</Btn>
              <Btn href="/resources" variant="ghost">More resources</Btn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, children }: { icon: typeof FileText; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white/10 text-gold-light">
        <Icon size={19} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="sw-cap text-white/55">{label}</dt>
        <dd className="m-0 mt-1 text-[1.02rem] font-medium text-white">{children}</dd>
      </div>
    </div>
  );
}
