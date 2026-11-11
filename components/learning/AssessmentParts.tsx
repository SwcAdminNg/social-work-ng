"use client";

import { useId, useState, type ReactNode } from "react";
import { Check, ChevronDown, LayoutGrid, ShieldAlert, X } from "lucide-react";

/** Shared Apple-style pieces for the quiz, quiz group and essay panels. */

type Tone = "gold" | "red" | "green" | "blue";

const SYMBOL_TONE: Record<Tone, string> = {
  gold: "lms-sym--gold",
  red: "lms-sym--red",
  green: "lms-sym--green",
  blue: "lms-sym--blue",
};

export function Notice({
  tone,
  icon,
  title,
  children,
  action,
  role,
}: {
  tone: Tone;
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  role?: "status" | "alert";
}) {
  return (
    <section className={`lms-notice lms-notice--${tone}`} role={role} aria-live={role ? "polite" : undefined}>
      <span className={`lms-sym lms-sym--sm ${SYMBOL_TONE[tone]}`} aria-hidden="true">
        {icon}
      </span>
      <div className="lms-notice-body">
        <h2 className="lms-notice-title font-[family-name:var(--font-roboto)] tracking-normal">{title}</h2>
        {children && <div className="lms-notice-text">{children}</div>}
      </div>
      {action}
    </section>
  );
}

export function FinalAssessmentNotice({ isLastSection, children }: { isLastSection?: boolean; children: ReactNode }) {
  return (
    <Notice
      tone="gold"
      icon={<ShieldAlert className="h-4 w-4" />}
      title={isLastSection ? "Final Exam for This Course" : "Final Assessment for This Module"}
    >
      {children}
    </Notice>
  );
}

export function MetaPills({ items }: { items: Array<string | null | false | undefined> }) {
  const shown = items.filter(Boolean) as string[];
  if (shown.length === 0) return null;
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Details">
      {shown.map((text) => (
        <li key={text} className="lms-pill">
          {text}
        </li>
      ))}
    </ul>
  );
}

export function QuestionProgress({
  index,
  total,
  answered,
  isAnswered,
  onSelect,
}: {
  index: number;
  total: number;
  answered: number;
  isAnswered: (idx: number) => boolean;
  onSelect: (idx: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-[0.8125rem] font-semibold text-accent">
          Question {index + 1} of {total}
          <span className="font-medium text-ink-3"> · {answered} answered</span>
        </p>
        {total > 1 && (
          <button
            type="button"
            className="lms-qjump"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <LayoutGrid aria-hidden="true" />
            All Questions
            <ChevronDown className="lms-qjump-chev" aria-hidden="true" />
          </button>
        )}
      </div>
      <span
        className="lms-meter mt-2.5"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Questions answered"
      >
        <span style={{ width: `${percent}%` }} />
      </span>
      {total > 1 && open && (
        <div id={panelId} className="lms-qpanel">
          <nav className="lms-qnav" aria-label="Go to question">
            {Array.from({ length: total }, (_, idx) => (
              <button
                key={idx}
                type="button"
                className="lms-qdot"
                onClick={() => {
                  onSelect(idx);
                  setOpen(false);
                }}
                data-answered={isAnswered(idx) ? "" : undefined}
                aria-current={idx === index ? "step" : undefined}
                aria-label={`Question ${idx + 1}, ${isAnswered(idx) ? "answered" : "unanswered"}`}
              >
                {idx + 1}
              </button>
            ))}
          </nav>
          <p className="lms-qlegend" aria-hidden="true">
            <span><i data-current="" />Current</span>
            <span><i data-answered="" />Answered</span>
            <span><i />Not answered</span>
          </p>
        </div>
      )}
    </div>
  );
}

export type ChoiceState = "correct" | "wrong" | undefined;

export function ChoiceList({
  name,
  multiple,
  options,
  selected,
  disabled,
  stateOf,
  onToggle,
  labelledBy,
}: {
  name: string;
  multiple: boolean;
  options: Array<{ id: string; text: string }>;
  selected: string[];
  disabled?: boolean;
  stateOf?: (optionId: string) => ChoiceState;
  onToggle: (optionId: string) => void;
  labelledBy?: string;
}) {
  return (
    <div className="lms-group" role="group" aria-labelledby={labelledBy}>
      {options.map((opt) => {
        const state = stateOf?.(opt.id);
        return (
          <label key={opt.id} className="lms-choice" data-state={state} aria-disabled={disabled ? "true" : undefined}>
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              checked={selected.includes(opt.id)}
              disabled={disabled}
              onChange={() => onToggle(opt.id)}
            />
            <span className={`lms-check ${multiple ? "lms-check--square" : ""}`} aria-hidden="true">
              {state === "wrong" ? <X strokeWidth={3.2} /> : <Check strokeWidth={3.2} />}
            </span>
            <span className="min-w-0 flex-1">{opt.text}</span>
            {state && <span className="lms-choice-note">{state === "correct" ? "Correct" : "Your answer"}</span>}
          </label>
        );
      })}
    </div>
  );
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

export function formatDue(date: Date) {
  return `Due ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date)}`;
}
