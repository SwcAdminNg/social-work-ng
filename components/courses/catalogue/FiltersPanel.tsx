"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { SlidersHorizontal } from "lucide-react";
import { SelectField } from "@/components/site/form";
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
  const wrapRef = useRef<HTMLDivElement>(null);

  // Runs after the chosen value has been written into the form.
  const applyOnWideScreens = () => {
    window.setTimeout(() => {
      if (window.matchMedia("(min-width: 768px)").matches) wrapRef.current?.closest("form")?.requestSubmit();
    }, 0);
  };

  return (
    <div ref={wrapRef} className={hydrated ? undefined : s.noJs}>
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
          <FilterSelect key={`${filter.name}:${filter.value}`} filter={filter} onPicked={applyOnWideScreens} />
        ))}
        <div className={s.panelActions}>
          <button type="submit" className={s.applyButton}>Apply</button>
          <Link href={clearHref} className={s.clearButton} scroll={false}>Clear</Link>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ filter, onPicked }: { filter: Filter; onPicked: () => void }) {
  const [value, setValue] = useState(filter.value);
  return (
    <div className={s.filterField}>
      <SelectField
        id={`filter-${filter.name}`}
        name={filter.name}
        label={filter.label}
        emptyLabel={filter.allLabel}
        options={filter.options}
        value={value}
        onChange={(next) => {
          setValue(next);
          onPicked();
        }}
        compact
      />
    </div>
  );
}
