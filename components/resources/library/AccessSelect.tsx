"use client";

import { useRef, useState } from "react";
import { SelectField } from "@/components/site/form";
import { RESOURCE_ACCESS_OPTIONS } from "@/lib/resources";
import s from "./Library.module.css";

/**
 * Access filter. Part of the search form, so it works as a normal form field
 * without JavaScript; with JavaScript it applies as soon as it changes.
 */
export default function AccessSelect({ value: initial }: { value: string }) {
  const [value, setValue] = useState(initial);
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapRef} className={s.accessField}>
      <SelectField
        id="resource-access"
        name="access"
        label="Access"
        emptyLabel="All access levels"
        options={RESOURCE_ACCESS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        value={value}
        onChange={(next) => {
          setValue(next);
          // Submit once the chosen value has been written into the form.
          window.setTimeout(() => wrapRef.current?.closest("form")?.requestSubmit(), 0);
        }}
        compact
      />
    </div>
  );
}
