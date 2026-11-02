"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

// Shows the first paragraph as a summary and reveals the rest on request,
// as the handover asks for long card copy.
export default function ExpandableCopy({
  paragraphs,
  className = "",
}: {
  paragraphs: string[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const [first, ...rest] = paragraphs;

  return (
    <div className={className}>
      <p>{first}</p>
      {rest.length > 0 && (
        <>
          <div id={id} hidden={!open} className="mt-3 space-y-3">
            {rest.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((o) => !o)}
            className="mt-3 inline-flex items-center gap-1 text-[0.8rem] font-semibold text-gray-500 dark:text-gray-400 hover:text-[#2D6A4F] dark:hover:text-[#52b788] cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]"
          >
            {open ? "Show less" : "Read more"}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        </>
      )}
    </div>
  );
}
