"use client";

import { useEffect, useState } from "react";
import { sectionIndex } from "./content";

/**
 * Wayfinding down the right-hand edge on wide screens: one line per
 * section, the current one longer and named. Blends against whatever
 * surface it sits on, so it reads on photos, white and deep green alike.
 */
export default function SectionIndex() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = sectionIndex
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    sections.forEach((el) => observer.observe(el));
    const onTop = () => {
      if (window.scrollY < window.innerHeight * 0.5) setActive(null);
    };
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className="hidden min-[1400px]:flex fixed right-7 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 mix-blend-difference text-white"
    >
      {sectionIndex.map((s) => {
        const current = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={current ? "true" : undefined}
            className="group flex items-center justify-end gap-3 py-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span
              className={`text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-opacity duration-300 ${
                current ? "opacity-100" : "opacity-0 group-hover:opacity-70"
              }`}
            >
              {s.label}
            </span>
            <span
              className={`block h-px bg-current transition-[width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                current
                  ? "w-9 opacity-100"
                  : "w-4 opacity-40 group-hover:opacity-80"
              }`}
              aria-hidden="true"
            />
          </a>
        );
      })}
    </nav>
  );
}
