"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { SlidersHorizontal } from "lucide-react";
import lib from "@/components/resources/library/Library.module.css";
import s from "./Catalogue.module.css";

type Option = { value: string; label: string };
type Filter = { name: string; label: string; value: string; allLabel: string; options: Option[] };

const noopSubscribe = () => () => {};

/**
 * Topic, level and cost filters. On wide screens a change applies at once; on
 * phones they sit in a labelled panel with Apply and Clear. Without JavaScript
 * the panel stays open and the search form's button applies them.
 */
export default function FiltersPanel({ filters, activeCount, clearHref }: { filters: Filter[]; activeCount: number; clearHref: string }) {
  const [open, setOpen] = useState(false);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const applyOnWideScreens = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (window.matchMedia("(min-width: 768px)").matches) event.currentTarget.form?.requestSubmit();
  };

  return (
    <div className={hydrated ? undefined : s.noJs}>
      <button
        type="button"
        className={s.panelToggle}
        aria-expanded={open}
        aria-controls="course-filters"
        onClick={() => setOpen((v) => !v)}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <SlidersHorizontal size={18} aria-hidden="true" /> Filters
        </span>
        {activeCount > 0 && (
          <span className={s.panelCount}>
            {activeCount}
            <span className="sr-only"> active</span>
          </span>
        )}
      </button>
      <div id="course-filters" className={`${s.filters} ${open ? s.filtersOpen : ""}`}>
        {filters.map((filter) => (
          <div key={filter.name} className={s.filterField}>
            <label htmlFor={`filter-${filter.name}`}>{filter.label}</label>
            <select
              key={filter.value}
              id={`filter-${filter.name}`}
              name={filter.name}
              className={lib.select}
              defaultValue={filter.value}
              onChange={applyOnWideScreens}
            >
              <option value="">{filter.allLabel}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className={s.panelActions}>
          <button type="submit" className={s.applyButton}>Apply</button>
          <Link href={clearHref} className={s.clearButton} scroll={false}>Clear</Link>
        </div>
      </div>
    </div>
  );
}
