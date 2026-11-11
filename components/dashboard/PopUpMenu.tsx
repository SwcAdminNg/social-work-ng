"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronsUpDown, LayoutGrid, List } from "lucide-react";

export type PopUpItem = {
  key: string;
  label: string;
  checked?: boolean;
  /** A link item (server-rendered filters); otherwise onSelect runs. */
  href?: string;
  onSelect?: () => void;
};

/**
 * Apple pop-up button: a capsule showing the current choice; it opens a small
 * menu with a checkmark beside the chosen item. Arrow keys move, Escape closes.
 */
export function PopUpMenu({
  label,
  icon,
  items,
  ariaLabel,
  direction = "down",
  align = "right",
  active = false,
  kind = "pulldown",
}: {
  label: ReactNode;
  icon?: ReactNode;
  items: PopUpItem[];
  ariaLabel: string;
  direction?: "down" | "up";
  align?: "left" | "right";
  /** Tints the button when a non-default choice is in effect. */
  active?: boolean;
  /** "pulldown" shows a chevron; "popup" shows the up/down chevrons of a value picker. */
  kind?: "pulldown" | "popup";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const menu = rootRef.current?.querySelector<HTMLElement>('[role="menu"]');
      (menu?.querySelector<HTMLElement>('[aria-checked="true"]') ?? menu?.querySelector<HTMLElement>('[role^="menuitem"]'))?.focus();
    });
    const onPress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPress, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onPress, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  function onMenuKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const list = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role^="menuitem"]'));
    const index = list.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === "Home" ? 0
      : event.key === "End" ? list.length - 1
      : event.key === "ArrowDown" ? (index + 1) % list.length
      : (index - 1 + list.length) % list.length;
    list[next]?.focus();
  }

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="relative flex-none">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={ariaLabel}
        className={`lms-pulldown ${active ? "lms-pulldown--on" : ""}`}
      >
        {icon}
        {label}
        {kind === "popup" ? (
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          onKeyDown={onMenuKey}
          className={`lms-menu ${direction === "up" ? "lms-menu--up" : "lms-menu--down"} ${align === "left" ? "lms-menu--start" : ""}`}
        >
          {items.map((item) => {
            const content = (
              <>
                <Check className={`h-4 w-4 ${item.checked ? "" : "invisible"}`} strokeWidth={2.4} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </>
            );
            return item.href ? (
              <Link
                key={item.key}
                href={item.href}
                role="menuitemradio"
                aria-checked={Boolean(item.checked)}
                onClick={close}
                className="lms-menu-item"
                scroll={false}
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.key}
                type="button"
                role="menuitemradio"
                aria-checked={Boolean(item.checked)}
                onClick={() => {
                  close();
                  item.onSelect?.();
                }}
                className="lms-menu-item"
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const VIEW_COOKIE = "swcl_catalog_view";

/** Finder-style view switch: two icon segments; the choice is remembered in a cookie. */
export function ViewSwitch({
  view,
  gridHref,
  listHref,
  cookie = VIEW_COOKIE,
}: {
  view: "grid" | "list";
  gridHref: string;
  listHref: string;
  cookie?: string;
}) {
  const remember = (value: "grid" | "list") => {
    document.cookie = `${cookie}=${value}; path=/; max-age=31536000; samesite=lax`;
  };
  return (
    <div role="group" aria-label="View" className="lms-segmented lms-segmented--icons">
      <Link
        href={gridHref}
        scroll={false}
        onClick={() => remember("grid")}
        aria-label="Grid view"
        title="Grid view"
        aria-current={view === "grid" ? "true" : undefined}
        className="lms-segment"
      >
        <LayoutGrid className="h-[17px] w-[17px]" strokeWidth={2} />
      </Link>
      <Link
        href={listHref}
        scroll={false}
        onClick={() => remember("list")}
        aria-label="List view"
        title="List view"
        aria-current={view === "list" ? "true" : undefined}
        className="lms-segment"
      >
        <List className="h-[17px] w-[17px]" strokeWidth={2} />
      </Link>
    </div>
  );
}

/** The same switch for lists rendered in the browser: buttons, and a cookie named by the caller. */
export function ViewToggle({
  view,
  onChange,
  cookie,
}: {
  view: "grid" | "list";
  onChange: (view: "grid" | "list") => void;
  cookie: string;
}) {
  const choose = (value: "grid" | "list") => {
    document.cookie = `${cookie}=${value}; path=/; max-age=31536000; samesite=lax`;
    onChange(value);
  };
  return (
    <div role="group" aria-label="View" className="lms-segmented lms-segmented--icons flex-none">
      <button type="button" onClick={() => choose("grid")} aria-label="Grid view" title="Grid view" aria-pressed={view === "grid"} aria-current={view === "grid" ? "true" : undefined} className="lms-segment">
        <LayoutGrid className="h-[17px] w-[17px]" strokeWidth={2} />
      </button>
      <button type="button" onClick={() => choose("list")} aria-label="List view" title="List view" aria-pressed={view === "list"} aria-current={view === "list" ? "true" : undefined} className="lms-segment">
        <List className="h-[17px] w-[17px]" strokeWidth={2} />
      </button>
    </div>
  );
}
