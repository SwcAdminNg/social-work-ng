"use client";

import { useRef, useState } from "react";
import { SelectField } from "@/components/site/form";
import s from "./Catalogue.module.css";

type Option = { value: string; label: string; description?: string };
type Filter = {
  name: string;
  label: string;
  value: string;
  allLabel: string;
  options: Option[];
  /** Heading and help shown in the chooser. */
  title?: string;
  help?: string;
};

/**
 * Topic, level and cost filters. Each opens a chooser (centred on wide
 * screens, a sheet from the bottom on phones) and applies as soon as an
 * option is picked. Without JavaScript they are ordinary selects, applied
 * by the Search button.
 */
export default function FiltersPanel({ filters }: { filters: Filter[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Runs after the chosen value has been written into the form.
  const apply = () => window.setTimeout(() => wrapRef.current?.closest("form")?.requestSubmit(), 0);

  return (
    <div ref={wrapRef} className={s.filters} role="group" aria-label="Filter courses">
      {filters.map((filter) => (
        <FilterSelect key={`${filter.name}:${filter.value}`} filter={filter} onPicked={apply} />
      ))}
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
        sheetTitle={filter.title}
        sheetDescription={filter.help}
        onChange={(next) => {
          setValue(next);
          onPicked();
        }}
        compact
      />
    </div>
  );
}
