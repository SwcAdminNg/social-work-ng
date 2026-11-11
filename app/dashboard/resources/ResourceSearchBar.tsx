"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const DEBOUNCE_MS = 450;

/** Searches as you type (after a short pause), in the dashboard's large search field. */
export function ResourceSearchBar({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialSearch);
  const [pending, startTransition] = useTransition();
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="lms-search lms-search--lg" role="search">
      <label htmlFor="resource-search" className="sr-only">
        Search resources
      </label>
      <Search aria-hidden="true" className="lms-search-glyph" strokeWidth={2.2} />
      <input
        id="resource-search"
        name="search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) setValue("");
        }}
        autoComplete="off"
        enterKeyHint="search"
        aria-busy={pending}
        placeholder="Search resources by title or topic"
      />
      {value && (
        <button type="button" onClick={() => setValue("")} aria-label="Clear search" className="lms-search-clear">
          <X className="h-3 w-3" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
