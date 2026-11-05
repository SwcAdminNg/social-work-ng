"use client";

import { IconEyeClosed, IconEyeOpen } from "./icons";

export function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Hide password" : "Show password"}
      aria-pressed={visible}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors duration-150 hover:bg-black/[0.04] hover:text-[#2D6A4F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6A4F] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-[#95d5b2] dark:focus-visible:ring-[#74c69d]"
    >
      {visible ? <IconEyeClosed /> : <IconEyeOpen />}
    </button>
  );
}
