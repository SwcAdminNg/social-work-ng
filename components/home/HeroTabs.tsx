"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, House, Users, type LucideIcon } from "lucide-react";
import s from "./Home.module.css";

type Panel = {
  id: string;
  tab: string;
  icon: LucideIcon;
  tone: string;
  lines: string[];
  text: string;
  image: string;
  alt: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
};

const PANELS: Panel[] = [
  {
    id: "home",
    tab: "Home",
    icon: House,
    tone: s.tabHome,
    lines: ["Strengthening Practice", "Developing People", "Improving Social Services"],
    text: "Social Work Consultancy Ltd supports individuals and organisations in strengthening professional practice, developing their workforce and improving services for children, families and communities.",
    image: "/images/home/swcl/hero-team.webp",
    alt: "Four professionals work together around a laptop, taking notes during a discussion.",
    primary: { label: "Explore Our Services", href: "#services" },
    secondary: { label: "Discuss Your Organisation’s Needs", href: "/contact?topic=partnership" },
  },
  {
    id: "elearning",
    tab: "E-Learning",
    icon: BookOpen,
    tone: s.tabLearning,
    lines: ["Professional Learning with a Practical Purpose"],
    text: "Develop the knowledge, skills and confidence to make informed decisions, respond to complex situations and work more effectively with people.",
    image: "/images/home/swcl/learning-foundation.webp",
    alt: "A woman studies at a laptop in a bright room with books and plants.",
    primary: { label: "Explore Our Learning Platform", href: "/courses" },
  },
  {
    id: "research",
    tab: "Research",
    icon: ChartNoAxesColumnIncreasing,
    tone: s.tabResearch,
    lines: ["Understand Needs", "Generate Evidence", "Improve Decisions"],
    text: "Our research and evaluation services help organisations ask the right questions, understand their findings and use evidence to strengthen programmes and service delivery.",
    image: "/images/home/swcl/service-research.webp",
    alt: "A professional reviews printed charts and reports at a desk.",
    primary: { label: "Explore Research and Evaluation", href: "/contact?topic=partnership" },
  },
  {
    id: "policy",
    tab: "Policy and Advocacy",
    icon: Users,
    tone: s.tabPolicy,
    lines: ["Supporting Better Policy and Meaningful Participation"],
    text: "We support policy development and advocacy that bring together evidence, professional experience and the perspectives of those affected by decisions.",
    image: "/images/home/swcl/service-policy.webp",
    alt: "A white civic building with a green dome, surrounded by trees and lawns.",
    primary: { label: "Explore Policy and Advocacy", href: "/contact?topic=partnership" },
  },
];

export default function HeroTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = PANELS[active];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = PANELS.length - 1;
    const next =
      event.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : event.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className={s.hero} aria-label="Introduction">
      <div className={s.heroMedia} data-nav-bg="#0c2a1d">
        {PANELS.map((p, i) => (
          <Image
            key={p.id}
            src={p.image}
            alt={i === active ? p.alt : ""}
            aria-hidden={i === active ? undefined : true}
            fill
            priority={i === 0}
            sizes="100vw"
            className={i === active ? s.heroImageOn : s.heroImageOff}
          />
        ))}
      </div>

      <div
        className={s.heroPanel}
        role="tabpanel"
        id={`hero-panel-${panel.id}`}
        aria-labelledby={`hero-tab-${panel.id}`}
      >
        <div className={s.container}>
          <h1 className={s.heroTitle}>
            {panel.lines.map((line) => (
              <span key={line}>
                {line}
                <span className={s.dot}>.</span>{" "}
              </span>
            ))}
          </h1>
          <p className={s.heroText}>{panel.text}</p>
          <div className={s.heroActions}>
            <Link className={s.btnGold} href={panel.primary.href}>
              {panel.primary.label}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {panel.secondary && (
              <Link className={s.btnGhost} href={panel.secondary.href}>
                {panel.secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className={s.container}>
        <div className={s.tabs} role="tablist" aria-label="Our work">
          {PANELS.map((p, i) => {
            const Icon = p.icon;
            const selected = i === active;
            return (
              <button
                key={p.id}
                ref={(el) => { tabs.current[i] = el; }}
                type="button"
                role="tab"
                id={`hero-tab-${p.id}`}
                aria-selected={selected}
                aria-controls={`hero-panel-${p.id}`}
                tabIndex={selected ? 0 : -1}
                className={`${s.tab} ${p.tone}`}
                onClick={() => setActive(i)}
                onKeyDown={onKeyDown}
              >
                <Icon className={s.tabIcon} size={22} aria-hidden="true" />
                <span className={s.tabLabel}>{p.tab}</span>
                <ArrowRight className={s.tabArrow} size={18} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
