"use client";

import { useEffect, useRef, useState } from "react";

export type SectionLink = { id: string; label: string };

/**
 * A menu of the sections on a long page. It stays in view while reading and
 * marks the section currently on screen.
 */
export default function SectionNav({ items, label = "On this page" }: { items: SectionLink[]; label?: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const barRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    let frame = 0;
    const pick = () => {
      frame = 0;
      // The section whose top has most recently passed a line a third of the way down.
      const line = window.innerHeight * 0.34;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  // On narrow screens the bar scrolls sideways; keep the current item in view.
  useEffect(() => {
    const bar = barRef.current;
    const link = bar?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!bar || !link) return;
    const target = link.offsetLeft - (bar.clientWidth - link.offsetWidth) / 2;
    bar.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [active]);

  if (items.length < 2) return null;

  return (
    <nav aria-label={label} className="sw-subnav">
      <ul ref={barRef} className="sw-subnav-bar">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="sw-subnav-link" aria-current={active === item.id ? "true" : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
