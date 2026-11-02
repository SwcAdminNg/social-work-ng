"use client";

import { useEffect, useState } from "react";

export type SectionTheme = { background: string; dark: boolean };

function parseRgb(color: string) {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = "1"] = m[1].split(/[\s,/]+/).filter(Boolean);
  return { r: +r, g: +g, b: +b, a: +a };
}

function isDarkColor(color: string) {
  const rgb = parseRgb(color);
  if (!rgb) return false;
  // Relative luminance (sRGB), close enough for picking a text colour.
  const lum = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return lum < 0.5;
}

// Finds what sits directly under the header and returns its background.
// A section can override with data-nav-bg (e.g. a photo hero) and
// data-nav-theme="dark" | "light"; otherwise the background of the
// enclosing section (or its first opaque ancestor) is used, so every page
// adapts without extra markup.
function readTheme(header: HTMLElement): SectionTheme | null {
  const y = header.getBoundingClientRect().bottom + 1;
  const stack = document.elementsFromPoint(window.innerWidth / 2, y);
  const target = stack.find((el) => !header.contains(el)) as
    | HTMLElement
    | undefined;
  if (!target) return null;

  const override = target.closest<HTMLElement>("[data-nav-bg]");
  if (override) {
    const background = override.dataset.navBg!;
    const theme = override.dataset.navTheme;
    return {
      background,
      dark: theme ? theme === "dark" : isDarkColor(background),
    };
  }

  // Match the section, not a card or photo that happens to sit under the
  // middle of the header.
  const start = target.closest<HTMLElement>("section, footer") ?? target;
  for (let el: HTMLElement | null = start; el; el = el.parentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    const rgb = parseRgb(bg);
    if (rgb && rgb.a > 0.5) {
      return {
        background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.82)`,
        dark: isDarkColor(bg),
      };
    }
  }
  return null;
}

export function useSectionTheme(
  headerRef: React.RefObject<HTMLElement | null>,
  deps: unknown[] = [],
) {
  const [theme, setTheme] = useState<SectionTheme | null>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = readTheme(header);
        setTheme((prev) =>
          prev?.background === next?.background && prev?.dark === next?.dark
            ? prev
            : next,
        );
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Re-read when light/dark mode is toggled on <html>.
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerRef, ...deps]);

  return theme;
}
