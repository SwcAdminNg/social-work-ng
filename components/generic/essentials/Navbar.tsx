"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, Mail, Phone } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSectionTheme } from "./useSectionTheme";
import ThemeToggle from "@/components/generic/ThemeToggle";

interface NavbarProps {
  isLoggedIn?: boolean;
}

const links = [
  { name: "Our Courses", href: "/courses" },
  { name: "Mentorship", href: "/mentorship" },
  { name: "About Us", href: "/about-us" },
  { name: "Resources", href: "/resources" },
  { name: "Contact Us", href: "/contact" },
];

const MENU_BG = "#04120b";
// Height the header occupies in the page; the hero sits underneath it.
export const HEADER_HEIGHT = 84;

// Critically damped spring for the header's motion.
const spring = { type: "spring" as const, bounce: 0, duration: 0.6 };

/**
 * Site header. At the top of the page it is a full-width translucent bar
 * over the content. Scroll down and it slides away, leaving the page to
 * itself; scroll back up and it returns as a floating capsule, so the
 * navigation is always one small gesture away without ever taking a strip
 * of the screen for good. Its colours follow the section beneath it.
 */
export default function Navbar({ isLoggedIn = false }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const sectionTheme = useSectionTheme(navRef, [pathname]);

  // Hide on the way down, show on the way up or near the top.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      setScrolled(y > 24);
      if (y < 120) setHidden(false);
      else if (delta > 6) setHidden(true);
      else if (delta < -4) setHidden(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The open menu is a dark sheet, so the bar matches it instead of the page.
  const theme = menuOpen ? { background: MENU_BG, dark: true } : sectionTheme;
  const onDark = theme?.dark ?? false;
  const capsule = scrolled && !menuOpen;
  const shown = !hidden || menuOpen;

  // Close when the route changes (adjusted during render, so no extra
  // effect), on Escape, and hold the page still behind the open menu.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const linkTone = onDark
    ? "text-white/90 hover:bg-white/10"
    : "text-gray-800 dark:text-[#D7E2DB] hover:bg-black/5 dark:hover:bg-white/10";
  const activeTone = onDark
    ? "text-[#F3C56B]"
    : "text-[#2D6A4F] dark:text-[#74c69d]";
  const accentBg = onDark ? "bg-[#F3C56B]" : "bg-[#2D6A4F] dark:bg-[#74c69d]";
  const barTone = onDark ? "bg-white" : "bg-gray-800 dark:bg-[#D7E2DB]";

  const accountHref = isLoggedIn ? "/dashboard" : "/login";
  const accountLabel = isLoggedIn ? "Dashboard" : "Login";

  // Items in the open menu arrive one after another.
  const list = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.055, delayChildren: 0.08 },
    },
  };
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: spring },
  };

  // Default surface when no section colour has been read yet.
  const fallbackBar = capsule
    ? "bg-white/85 dark:bg-[#0F1A14]/85"
    : "bg-white/55 dark:bg-[#0B1410]/60";

  return (
    <nav
      ref={navRef}
      aria-label="Primary"
      onFocusCapture={() => setHidden(false)}
      className="sticky top-0 z-50 h-[84px]"
    >
      <motion.div
        initial={false}
        animate={{ y: shown ? 0 : -120 }}
        transition={reduce ? { duration: 0.2 } : spring}
        style={theme ? { backgroundColor: theme.background } : undefined}
        className={`absolute backdrop-blur-xl ${
          menuOpen
            ? "transition-none"
            : "transition-[top,height,left,right,border-radius,box-shadow,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        } ${
          capsule
            ? `top-3 h-16 rounded-full inset-x-4 md:inset-x-[max(1.5rem,calc((100%-72rem)/2+1.5rem))] ring-1 ring-inset ${
                onDark ? "ring-white/10" : "ring-black/5 dark:ring-white/10"
              } shadow-[0_18px_50px_-20px_rgba(4,18,11,0.45)]`
            : `top-0 h-[84px] rounded-none inset-x-0 border-b ${
                onDark
                  ? "border-white/10"
                  : "border-black/5 dark:border-white/10"
              }`
        } ${theme ? "" : fallbackBar}`}
      >
        <div
          className={`h-full mx-auto flex items-center gap-6 transition-[padding] duration-500 ${
            capsule ? "px-5 md:px-7" : "max-w-6xl px-6"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center flex-shrink-0 no-underline"
            aria-label="Social Work Consultancy Home"
          >
            <img
              src="/images/logo/swc-dark-logo-trim.png"
              alt="SWC Logo"
              width={1322}
              height={386}
              className={`h-auto object-contain transition-[filter,width] duration-500 ${
                capsule ? "w-[128px] md:w-[136px]" : "w-[148px] md:w-[156px]"
              } ${onDark ? "brightness-0 invert" : ""}`}
            />
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-1 list-none m-0 p-0 flex-1 justify-center">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`relative flex items-center px-4 py-2 text-[0.92rem] font-medium rounded-full transition-colors no-underline whitespace-nowrap group ${linkTone} ${
                      isActive ? activeTone : ""
                    }`}
                  >
                    {link.name}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full ${accentBg} transition-all duration-300 ${
                        isActive
                          ? "w-[60%] opacity-100"
                          : "w-0 opacity-0 group-hover:w-[30%] group-hover:opacity-40"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Light/dark switch and account link — desktop */}
          <ThemeToggle
            tone={onDark ? "dark" : "light"}
            className="hidden lg:flex shrink-0"
          />
          <Link
            href={accountHref}
            className={`hidden lg:inline-flex items-center justify-center min-h-[40px] px-5 rounded-full text-[0.9rem] font-bold no-underline flex-shrink-0 transition-[background-color,color,scale] duration-200 active:scale-[0.97] ${
              onDark
                ? "bg-white text-[#14402F] hover:bg-[#F3C56B] hover:text-[#10291E]"
                : "bg-[#14402F] text-white hover:bg-[#2D6A4F] dark:bg-[#74c69d] dark:text-[#0B1410] dark:hover:bg-[#95d5b2]"
            }`}
          >
            {accountLabel}
          </Link>

          {/* Light/dark switch — mobile */}
          <ThemeToggle
            tone={onDark ? "dark" : "light"}
            className="lg:hidden ml-auto shrink-0"
          />

          {/* Menu button — mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu-panel"
            className={`lg:hidden flex flex-col items-center justify-center gap-[5px] w-11 h-11 bg-transparent border-0 ${
              onDark ? "hover:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10"
            } cursor-pointer p-1 rounded-full transition-colors`}
          >
            <span
              className={`block w-[22px] h-[2px] ${barTone} rounded transition-transform duration-300 origin-center ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`block w-[22px] h-[2px] ${barTone} rounded transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-[22px] h-[2px] ${barTone} rounded transition-transform duration-300 origin-center ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </motion.div>

      {/* Mobile menu: a full-height dark sheet. Links arrive one after
          another; the platform, account and contact details sit at the foot. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu-panel"
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.22 } }}
            transition={{ duration: 0.3 }}
            className="lg:hidden absolute inset-x-0 top-[84px] h-[calc(100dvh-84px)] z-50 overflow-y-auto text-white"
            style={{ backgroundColor: MENU_BG }}
          >
            <div
              className="pointer-events-none absolute -top-24 right-[-20%] w-[26rem] h-[26rem] rounded-full bg-[#2D6A4F]/35 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute bottom-[-10%] left-[-20%] w-[22rem] h-[22rem] rounded-full bg-[#EBA937]/10 blur-3xl"
              aria-hidden="true"
            />

            <motion.div
              variants={list}
              initial="hidden"
              animate="show"
              className="relative min-h-full flex flex-col px-6 pt-8 pb-10"
            >
              <motion.p
                variants={item}
                className="flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-[#F3C56B]"
              >
                <span className="h-px w-6 bg-current" aria-hidden="true" />
                Menu
              </motion.p>

              <ul className="mt-6 list-none m-0 p-0 divide-y divide-white/10">
                {links.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.li key={link.name} variants={item}>
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className="group flex items-center justify-between gap-6 py-4 no-underline"
                      >
                        <span className="flex items-baseline gap-4">
                          <span className="text-[0.72rem] font-bold tabular-nums text-white/40">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={`text-[1.7rem] font-bold tracking-[-0.03em] leading-none transition-colors ${
                              isActive ? "text-[#F3C56B]" : "text-white"
                            }`}
                          >
                            {link.name}
                          </span>
                        </span>
                        <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full ring-1 ring-white/15 text-white/70 transition-[background-color,color] duration-300 group-hover:bg-white group-hover:text-[#14402F] group-active:bg-white group-active:text-[#14402F]">
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <div className="mt-auto pt-10 space-y-3">
                <motion.div variants={item}>
                  <Link
                    href="/courses"
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center justify-between gap-4 rounded-[22px] bg-[#EBA937] text-[#10291E] p-5 no-underline active:scale-[0.99] transition-transform"
                  >
                    <span>
                      <span className="block text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#10291E]/70">
                        Professional learning
                      </span>
                      <span className="block mt-1 text-[1.05rem] font-bold leading-snug">
                        Visit socialworknigeria.org
                      </span>
                    </span>
                    <ArrowUpRight
                      className="w-5 h-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>

                <motion.div variants={item}>
                  <Link
                    href={accountHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center min-h-[54px] rounded-full ring-1 ring-inset ring-white/30 text-white text-[1rem] font-bold no-underline hover:bg-white hover:text-[#14402F] active:scale-[0.98] transition-[background-color,color,scale] duration-200"
                  >
                    {accountLabel}
                  </Link>
                </motion.div>

                <motion.div
                  variants={item}
                  className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.85rem] text-white/60"
                >
                  <a
                    href="tel:+2348064047702"
                    className="inline-flex items-center gap-2 hover:text-white no-underline"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    +234 806 404 7702
                  </a>
                  <a
                    href="mailto:support@socialworknigeria.org"
                    className="inline-flex items-center gap-2 hover:text-white no-underline"
                  >
                    <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                    support@socialworknigeria.org
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
