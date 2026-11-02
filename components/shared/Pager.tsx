import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Previous / page / next as capsule buttons beneath a list.
export default function Pager({
  page,
  hasNext,
  hrefFor,
  scroll = true,
}: {
  page: number;
  hasNext: boolean;
  hrefFor: (page: number) => string;
  scroll?: boolean;
}) {
  const button =
    "inline-flex items-center gap-2 min-h-[46px] px-5 rounded-full text-[0.9rem] font-bold transition-colors";
  const live = `${button} bg-white dark:bg-[#16231C] text-gray-900 dark:text-[#ECF2EE] ring-1 ring-black/10 dark:ring-white/10 hover:bg-[#EEF5F1] dark:hover:bg-[#1c2d24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F]`;
  const dead = `${button} bg-transparent text-gray-400 dark:text-[#A3B3A9]/50 ring-1 ring-black/5 dark:ring-white/5 cursor-not-allowed`;

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} scroll={scroll} className={live}>
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span className={dead} aria-disabled="true">
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Previous
        </span>
      )}
      <span className="px-3 text-[0.85rem] font-bold uppercase tracking-[0.16em] text-gray-500 dark:text-[#A3B3A9]">
        Page {page}
      </span>
      {hasNext ? (
        <Link href={hrefFor(page + 1)} scroll={scroll} className={live}>
          Next
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={dead} aria-disabled="true">
          Next
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
