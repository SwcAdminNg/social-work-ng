"use client";

import { RESOURCE_ACCESS_OPTIONS } from "@/lib/resources";
import s from "./Library.module.css";

/**
 * Access filter. Part of the search form, so it works as a normal form field
 * without JavaScript; with JavaScript it applies as soon as it changes.
 */
export default function AccessSelect({ value }: { value: string }) {
  return (
    <div className={s.accessField}>
      <label htmlFor="resource-access" className={s.accessLabel}>
        Access
      </label>
      <select
        id="resource-access"
        name="access"
        className={s.select}
        defaultValue={value}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <option value="">All access levels</option>
        {RESOURCE_ACCESS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
