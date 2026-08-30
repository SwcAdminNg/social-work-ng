import { ResourceAttachments } from "@/components/resources/ResourceAttachments";
import { formatResourceCategory, getResource } from "@/lib/resources";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock, Unlock } from "lucide-react";

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const { resource, ok } = await getResource(slug);

  if (!ok || !resource) return { title: "Resource Not Found | Social Work Nigeria" };

  return {
    title: `${resource.name} | Resources | Social Work Nigeria`,
    description:
      resource.description ||
      "Browse professional social work resources, templates, recordings, and practice material.",
  };
}

export default async function ResourceDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const { resource, status } = await getResource(slug);

  if (status === 404) notFound();

  if (!resource) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-sm font-extrabold text-red-600">
          Failed to load this resource.
        </p>
      </main>
    );
  }

  const isLocked = resource.can_access === false;

  return (
    <main className="bg-white dark:bg-gray-950">
      <section className="relative overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage: `url("${resource.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"}")`,
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Link
            href="/resources"
            className="mb-8 inline-flex items-center gap-2 text-sm font-extrabold text-white/80 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to resources
          </Link>
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#2D6A4F]">
                {formatResourceCategory(resource.category)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white ring-1 ring-white/20">
                {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                {isLocked ? "Locked attachments" : "Unlocked"}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              {resource.name}
            </h1>
            {resource.description && (
              <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-200">
                {resource.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <ResourceAttachments resource={resource} />
      </section>
    </main>
  );
}
