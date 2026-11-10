"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Search, X } from "lucide-react";
import { siteFonts } from "@/lib/fonts";

/**
 * A dialog that sits in the middle of the screen on wide screens and rises
 * from the bottom edge on phones, where it can be dragged down to dismiss.
 * Styles live under ".swm" in app/globals.css.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  eyebrow,
  children,
  footer,
  onOpened,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Runs once the sheet is on screen; use it to place focus. */
  onOpened?: (event: Event) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startY: number; dy: number } | null>(null);

  // Phones: pull the header down to dismiss.
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(min-width: 640px)").matches) return;
    if ((event.target as HTMLElement).closest("button, input, a")) return;
    drag.current = { startY: event.clientY, dy: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const el = contentRef.current;
    if (!state || !el) return;
    state.dy = Math.max(0, event.clientY - state.startY);
    el.style.transition = "none";
    el.style.transform = `translate3d(0, ${state.dy}px, 0)`;
  };
  const onPointerUp = () => {
    const state = drag.current;
    const el = contentRef.current;
    drag.current = null;
    if (!state || !el) return;
    el.style.transition = "";
    if (state.dy > 110) {
      onOpenChange(false);
    } else {
      el.style.transform = "";
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="swm-overlay" />
        <Dialog.Content
          ref={contentRef}
          className={`swm ${siteFonts}`}
          onOpenAutoFocus={onOpened}
        >
          <div className="swm-head" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
            <span className="swm-grip" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              {eyebrow && <p className="sw-eyebrow m-0 mb-3 text-accent">{eyebrow}</p>}
              <Dialog.Title className="sw-display m-0 text-[1.65rem] leading-[1.05] text-ink">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="m-0 mt-2 text-[0.95rem] leading-relaxed text-ink-2">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">Choose an option, or press Escape to close.</Dialog.Description>
              )}
            </div>
            <Dialog.Close className="swm-close" aria-label="Close">
              <X size={18} aria-hidden="true" />
            </Dialog.Close>
          </div>
          {children}
          {footer && <div className="swm-foot">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type PickerOption = {
  value: string;
  label: string;
  /** A line of help under the label. */
  description?: string;
  /** Shown before the label: an icon, a flag. */
  leading?: ReactNode;
  /** Shown after the label, quietly: a count, a dialling code. */
  trailing?: string;
  /** Extra words the search should match. */
  keywords?: string;
};

/**
 * Choose one option from a list, in a Sheet. With many options a search box
 * appears. Arrow keys move, Enter chooses, typing searches.
 */
export function OptionPicker({
  open,
  onOpenChange,
  title,
  description,
  eyebrow,
  options,
  value,
  onSelect,
  searchPlaceholder = "Search",
  searchable,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  options: PickerOption[];
  value: string;
  onSelect: (value: string) => void;
  searchPlaceholder?: string;
  /** Defaults to on when there are more than eight options. */
  searchable?: boolean;
}) {
  const uid = useId();
  const withSearch = searchable ?? options.length > 8;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    const digits = q.replace(/\D/g, "");
    // Best matches first: the name starts with it, then a word in it does, then it appears anywhere.
    const rank = (option: PickerOption) => {
      const label = option.label.toLowerCase();
      if (label.startsWith(q)) return 0;
      if (label.split(/[\s(-]+/).some((word) => word.startsWith(q))) return 1;
      if ((option.keywords ?? "").toLowerCase() === q) return 1;
      if (digits.length > 0 && (option.trailing ?? "").replace(/\D/g, "").startsWith(digits)) return 1;
      const haystack = `${label} ${option.keywords ?? ""} ${option.trailing ?? ""}`.toLowerCase();
      return haystack.includes(q) ? 2 : -1;
    };
    return options
      .map((option, index) => ({ option, index, score: rank(option) }))
      .filter((entry) => entry.score >= 0)
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .map((entry) => entry.option);
  }, [options, query]);

  // Each time it opens: clear the search and start on the current choice.
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setActive(Math.max(0, options.findIndex((option) => option.value === value)));
    }
  }

  const activeIndex = Math.min(active, Math.max(0, shown.length - 1));

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex, shown]);

  const choose = (option: PickerOption | undefined) => {
    if (!option) return;
    onSelect(option.value);
    onOpenChange(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(shown.length - 1, activeIndex + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(0, activeIndex - 1));
    } else if (event.key === "Home" && !withSearch) {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End" && !withSearch) {
      event.preventDefault();
      setActive(shown.length - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(shown[activeIndex]);
    }
  };

  const optionId = (index: number) => `${uid}-option-${index}`;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      eyebrow={eyebrow}
      onOpened={(event) => {
        // Search first on a desktop keyboard; on touch screens leave the keyboard down.
        event.preventDefault();
        if (withSearch && window.matchMedia("(hover: hover) and (pointer: fine)").matches) searchRef.current?.focus();
        else listRef.current?.focus();
      }}
    >
      {withSearch && (
        <div className="swm-search">
          <Search size={18} aria-hidden="true" />
          <input
            ref={searchRef}
            type="text"
            inputMode="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            role="combobox"
            aria-expanded="true"
            aria-controls={`${uid}-list`}
            aria-activedescendant={shown.length ? optionId(activeIndex) : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); searchRef.current?.focus(); }} aria-label="Clear search">
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      <div
        ref={listRef}
        id={`${uid}-list`}
        role="listbox"
        aria-label={title}
        tabIndex={withSearch ? -1 : 0}
        aria-activedescendant={shown.length ? optionId(activeIndex) : undefined}
        onKeyDown={withSearch ? undefined : onKeyDown}
        className="swm-list"
        data-lenis-prevent
      >
        {shown.length === 0 ? (
          <p className="m-0 px-4 py-10 text-center text-ink-3">Nothing matches “{query.trim()}”.</p>
        ) : (
          shown.map((option, index) => {
            const selected = option.value === value;
            return (
              <div
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={selected}
                data-active={index === activeIndex}
                className="swm-option"
                onClick={() => choose(option)}
                onPointerMove={() => {
                  if (index !== activeIndex) setActive(index);
                }}
              >
                {option.leading && <span className="swm-option-lead" aria-hidden="true">{option.leading}</span>}
                <span className="min-w-0 flex-1">
                  <span className="swm-option-label">{option.label}</span>
                  {option.description && <span className="swm-option-desc">{option.description}</span>}
                </span>
                {option.trailing && <span className="swm-option-trail">{option.trailing}</span>}
                <span className="swm-option-mark" aria-hidden="true">
                  <Check size={14} strokeWidth={3} />
                </span>
              </div>
            );
          })
        )}
      </div>
    </Sheet>
  );
}
